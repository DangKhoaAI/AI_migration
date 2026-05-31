# Engineering Constitution

> Applies to the FastAPI + React migration of the Todo app.  
> All downstream stages (analysis, implementation, QA) must respect these principles.

---

## 1. Testing

- **Test-first for API contracts** — Write a failing test (or OpenAPI example) before implementing any new endpoint.
- **Backend** — pytest with `TestClient` (FastAPI) and `factory_boy` / `faker` for fixtures. Every endpoint must have at least one success and one error test.
- **Frontend** — Vitest + React Testing Library. User interactions (create task, toggle complete, delete, edit title) must be covered by component/integration tests.
- **E2E** — Playwright for critical paths: sign-in → create task → toggle → delete → sign-out.
- **Coverage gate** — Backend ≥ 80%, Frontend unit ≥ 70%. E2E smoke tests must pass before any PR is marked ready.

## 2. Error Handling

- **Fail explicitly, never silently.**  
  If an operation cannot complete, propagate a structured error. No bare `console.log` error swallowing (legacy anti-pattern).
- **Backend** — Use FastAPI `HTTPException` with standard status codes. Log unexpected exceptions with stack traces; do not leak internal details to the client.
- **Frontend** — Global error boundary (`ErrorBoundary`) catches render crashes. API errors are surfaced via toast/alert UI, not buried in the console.
- **Auth errors** — 401/403 must immediately clear invalid tokens and redirect the user to the sign-in page.

## 3. Logging & Observability

- **Backend** — Structured JSON logging (`structlog` or standard `logging` with JSON formatter). Include `trace_id` (UUID) per request for correlation.
- **Frontend** — Log only actionable events (auth state changes, unhandled API errors) to the console in dev builds. Strip debug logs from production builds.
- **Do not log** — Passwords, tokens, or PII. Mask `Authorization` headers and user emails in logs.

## 4. Security

- **Input validation** — Trust nothing from the client. All request bodies and query params pass through Pydantic schemas.
- **SQL injection prevention** — Use SQLAlchemy ORM exclusively; no raw string interpolation into queries.
- **Auth tokens** — JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days. Store tokens in `httpOnly` cookies if the frontend is served from the same domain; otherwise use `Authorization: Bearer` header with secure localStorage access patterns.
- **Passwords** — Hash with `bcrypt` (minimum cost factor 12). Never store or transmit plain text passwords.
- **CORS** — Whitelist explicit origins. Do not use `allow_origins=["*"]` in production.
- **Dependencies** — Pin major versions in `requirements.txt` and `package.json`. Run `pip-audit` / `npm audit` in CI.

## 5. Code Quality

- **Type safety** — Strict TypeScript (`strict: true`) on the frontend. Strict Pydantic models on the backend. `Any` and `ignore` are last resorts and must be justified in a comment.
- **Linting** — Ruff (backend) and ESLint + Prettier (frontend) run in pre-commit hooks. CI fails on lint errors.
- **Docstrings** — Public backend functions and complex frontend hooks include a one-line docstring explaining purpose and side effects.

## 6. Performance

- **Database** — Index `tasks(user_id, completed)` and `tasks(user_id, created_at)` from day one.
- **Frontend bundles** — Vite `rollupOptions` output manual chunks for `react`, `react-router-dom`, and `react-query` to improve caching.
- **API** — Keep response payloads small; do not nest unnecessary relations.

## 7. Compatibility & Deprecation

- **API versioning** — Prefix all routes with `/api/v1`. Breaking changes require a new version path, never in-place mutation.
- **Database migrations** — Alembic migrations must be reversible (`downgrade` implemented) and idempotent where possible.
