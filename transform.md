# Transformation Policy: Angular + Firebase → FastAPI + React

> **Status:** `draft`  
> **Policy agent:** migration-policy-agent  
> **Last updated:** 2026-05-31

---

## 1. Migration Mode

**Mode:** `migration`  
Replace the legacy implementation while preserving all user-facing behavior (feature parity). The app remains a single-user Todo SPA with OAuth sign-in, task CRUD, and real-time list updates.

---

## 2. Guiding Principle

> *Preserve behavior, replace plumbing.*  
> Every user-visible feature in the legacy app must have an equivalent in the new stack. Internal implementation details (dependency injection, RxJS streams, Firebase SDK) are free to change.

---

## 3. In-Scope

| Area | Legacy | Target | Notes |
|------|--------|--------|-------|
| Backend runtime | Firebase (BaaS) | FastAPI (Python 3.11+) | Self-hosted API with auto-generated OpenAPI docs |
| Frontend framework | Angular 4 | React 18+ | SPA, functional components + Hooks |
| Frontend build | Angular CLI | Vite 5+ | Faster dev/build, native TypeScript |
| Frontend router | Angular Router | React Router 6 | Hash routing (`useHash: false`) → BrowserRouter |
| Auth | Firebase Auth (OAuth popup) | OAuth2 / JWT (FastAPI) | Access token + refresh token; social login via external providers optional |
| Database | Firebase Realtime DB | SQLite (dev) / PostgreSQL (prod) | SQLAlchemy 2.x ORM + Alembic migrations |
| Data access | AngularFire2 observables | REST API + React Query / SWR | Polling-based live updates; SSE/WebSocket out-of-scope initially |
| Task model | `ITask` (`$key`, `title`, `completed`, `createdAt`) | Equivalent Pydantic/SQLAlchemy schema | Preserve field semantics; replace `$key` with integer `id` |
| Styling | SCSS (component + global) | SCSS via Vite | Reuse existing SCSS variables/mixins where possible |
| Routing guards | `RequireAuthGuard`, `RequireUnauthGuard` | React Router route guards / HOC | Redirect unauthenticated users to `/`; redirect authenticated away from `/` |
| E2E / unit tests | Karma / Protractor | Vitest + React Testing Library + Playwright | Replace legacy test tooling |

---

## 4. Out-of-Scope

- **Real-time push** — Firebase RTDB live sync will be replaced by client-side polling (React Query `refetchInterval`) or manual refresh. SSE/WebSocket upgrades are deferred.
- **Firebase hosting / CDN** — New deployment target is a generic container/VM (Docker) or static host (Vercel/Netlify) for the frontend.
- **Legacy data migration (ETL)** — No automated import of existing Firebase tasks. The new database starts fresh. If the user later requests data migration, it will be treated as a separate work-stream.
- **PWA / service worker** — `sw-precache` is dropped. Vite PWA plugin can be reintroduced later if needed.
- **CI/CD pipeline** — CircleCI config will not be migrated initially. A GitHub Actions (or similar) pipeline will be added in a follow-up stage.

---

## 5. Transformation Rules

### 5.1 Backend (FastAPI)

1. **Project layout** — Follow the standard FastAPI project structure:
   ```
   backend/
   ├── app/
   │   ├── main.py
   │   ├── api/
   │   ├── core/
   │   ├── models/
   │   ├── schemas/
   │   ├── services/
   │   └── dependencies.py
   ├── alembic/
   ├── tests/
   ├── Dockerfile
   └── requirements.txt
   ```
2. **ORM** — SQLAlchemy 2.x with declarative base. Use `async` drivers (`asyncpg` for PostgreSQL, `aiosqlite` for SQLite) and `AsyncSession` where feasible, but sync SQLAlchemy is acceptable for a Todo app if it simplifies onboarding.
3. **Migrations** — Alembic for all schema changes. Initial migration creates `users` and `tasks` tables.
4. **Auth** — OAuth2 password bearer flow (JWT access tokens, `python-jose`). Social login (GitHub, Google, Twitter, Facebook) can be layered later via external OAuth2 libraries (`authlib`). Anonymous login is deprecated unless explicitly requested.
5. **Schemas** — Pydantic v2 for request/response validation. Keep schemas close to the legacy `ITask` shape but replace `$key` with `id: int`.
6. **API design** — Resource-oriented REST:
   - `POST   /auth/login`
   - `POST   /auth/register`
   - `GET    /users/me`
   - `GET    /tasks`
   - `POST   /tasks`
   - `PUT    /tasks/{id}`
   - `DELETE /tasks/{id}`
   - Query param `?completed=true|false` replaces `filterTasks` behavior.
7. **CORS** — Allow the frontend origin(s) explicitly.
8. **Error responses** — Standard HTTP status codes + RFC 7807 `application/problem+json` format.

### 5.2 Frontend (React)

1. **Project layout** — Vite + React + TypeScript template:
   ```
   frontend/
   ├── src/
   │   ├── main.tsx
   │   ├── App.tsx
   │   ├── api/
   │   ├── components/
   │   ├── hooks/
   │   ├── pages/
   │   ├── routes/
   │   ├── styles/
   │   └── types/
   ├── public/
   ├── index.html
   ├── vite.config.ts
   └── package.json
   ```
2. **Components** — Map 1:1 legacy components to React equivalents:
   - `AppComponent` → `App.tsx`
   - `AppHeaderComponent` → `Header.tsx`
   - `SignInComponent` → `SignInPage.tsx`
   - `TasksComponent` → `TasksPage.tsx`
   - `TaskFormComponent` → `TaskForm.tsx`
   - `TaskListComponent` → `TaskList.tsx`
   - `TaskItemComponent` → `TaskItem.tsx`
3. **State management** — React Query (TanStack Query) for server state (tasks, auth). Local UI state (editing mode, form inputs) uses `useState` / `useReducer`.
4. **HTTP client** — `axios` or native `fetch` wrapped in a small API layer. Include an interceptor to attach JWT `Authorization: Bearer <token>`.
5. **Routing** — React Router 6 with route guards implemented as wrapper components (`<RequireAuth>`, `<RequireUnauth>`).
6. **TypeScript** — Strict mode enabled. Reuse `ITask` interface shape; rename `$key` → `id`.
7. **Styling** — Keep SCSS. Migrate component-level SCSS files to co-located `*.module.scss` or plain `*.scss` imports. Global grid/settings/base SCSS moves to `src/styles/`.
8. **Forms** — Controlled inputs with native React form handling (no heavy form library needed for two simple forms).

### 5.3 Database

1. **Dev database** — SQLite (file-based, zero-config).
2. **Prod database** — PostgreSQL (documented in `README.md` / `.env.example`; not enforced at runtime).
3. **Schema** —
   - `users` table: `id`, `email`, `hashed_password`, `created_at`
   - `tasks` table: `id`, `user_id` (FK), `title`, `completed` (bool), `created_at`
4. **Ownership** — All queries must filter by `user_id` (equivalent to Firebase rules `auth.uid === $uid`).

---

## 6. Repository & Naming Conventions

- **Monorepo layout** — Root contains `backend/` and `frontend/` directories. Legacy Angular source is kept in a `legacy/` directory (or on a `legacy` branch) for reference during migration.
- **File naming** — React components use PascalCase (`TaskList.tsx`). Stylesheets use kebab-case matching the component (`task-list.module.scss`). FastAPI modules use snake_case.
- **Git commits** — Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).
- **Branching** — `main` is the migration target branch. Legacy code remains reachable via Git history.

---

## 7. API Conventions

- **Base path** — `/api/v1`
- **Content-Type** — `application/json` unless otherwise specified.
- **Pagination** — Not required for Todo list (expected < 1,000 tasks per user). Add `limit`/`offset` if scope expands.
- **Filtering / Sorting** — `GET /tasks?completed=false` for active tasks; default sort `created_at DESC`.

---

## 8. Error Handling

- **Backend** — Catch all exceptions via FastAPI exception handlers. Return structured error JSON with `detail`, `status_code`, and `type`.
- **Frontend** — React Query `onError` callbacks surface API errors as toast / inline messages. Network errors default to a generic retry-with-backoff strategy.
- **Auth errors** — 401 responses trigger a logout + redirect to `/`.

---

## 9. Non-Functional Requirements

| NFR | Target | How |
|-----|--------|-----|
| Performance | First paint < 1.5s on 3G | Vite code-splitting, lazy-loaded routes |
| Accessibility | WCAG 2.1 AA | Preserve existing ARIA labels, keyboard navigation, focus management |
| Security | OWASP Top 10 baseline | HTTPS-only, secure cookies, bcrypt passwords, parameterized queries (SQLAlchemy) |
| Test coverage | ≥ 80% backend, ≥ 70% frontend unit | Vitest + pytest |
| Build artifact | Docker image for backend, static build for frontend | Multi-stage Dockerfile |

---

## 10. Assumptions & Inferred Decisions

| # | Decision | Rationale | Classification |
|---|----------|-----------|----------------|
| 1 | SQLite for dev / PostgreSQL for prod | Standard FastAPI stack; keeps dev friction low while prod remains scalable. | **Inferred** |
| 2 | OAuth2 Password Bearer + JWT | Replaces Firebase Auth popup flow with a conventional token-based API auth. Social login deferred. | **Proposed** |
| 3 | No legacy data migration | Fresh start avoids complex Firebase RTDB → SQL ETL for a demo Todo app. | **Proposed** |
| 4 | React Query for server state | Replaces RxJS/FirebaseListObservable with modern data-fetching patterns. | **Confirmed** (best practice) |
| 5 | SCSS retained | Minimizes UI rework while porting to React. | **Proposed** |
| 6 | Anonymous login dropped | Not standard in self-hosted OAuth2/JWT stacks; re-add if user requests. | **Proposed** |
| 7 | No WebSocket/SSE | Polling keeps scope contained; real-time can be added later without breaking API contract. | **Proposed** |

---

## 11. Open Questions

1. **Social login providers** — Should the new backend support Google/GitHub/Twitter/Facebook login natively, or is email/password sufficient for the MVP? *(Default: email/password only; social login as future enhancement.)*
2. **Deployment target** — Should the final deliverable include a `docker-compose.yml` for local orchestration, or is separate frontend/backend startup acceptable? *(Default: provide `docker-compose.yml`.)*
3. **Task ownership scope** — The legacy app uses per-user Firebase paths (`/tasks/{uid}`). Should tasks remain strictly private, or is there any future multi-user/sharing requirement? *(Default: strict per-user isolation.)*

---

## 12. Policy Status

`draft` — awaiting user review before downstream analysis or implementation begins.
