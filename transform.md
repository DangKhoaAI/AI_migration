# Transformation Policy: Angular + Firebase → FastAPI + React

> **Status:** `draft`  
> **Policy agent:** migration-policy-agent  
> **Last updated:** 2026-05-31

---

## 1. Migration Mode

**Mode:** `migration`  
Replace the legacy implementation while preserving the core user-facing behavior. The app remains a Todo SPA with sign-in, task CRUD, and refreshed task lists, but all runtime behavior must work locally without Firebase, hosted OAuth providers, managed databases, or other third-party service setup.

---

## 2. Guiding Principle

> *Local-first replacement, same product intent.*
> Every core user-visible feature in the legacy app must have an equivalent in the new stack, but any feature that previously depended on a hosted third-party service must be replaced with local code and open-source libraries. Internal implementation details (dependency injection, RxJS streams, Firebase SDK, hosted auth flows) are free to change.

---

## 3. In-Scope

| Area | Legacy | Target | Notes |
|------|--------|--------|-------|
| Backend runtime | Firebase (BaaS) | FastAPI (Python 3.11+) | Local self-hosted API with auto-generated OpenAPI docs |
| Frontend framework | Angular 4 | React 18+ | SPA, functional components + Hooks |
| Frontend build | Angular CLI | Vite 5+ | Faster dev/build, native TypeScript |
| Frontend router | Angular Router | React Router 6 | Hash routing (`useHash: false`) → BrowserRouter |
| Auth | Firebase Auth (OAuth popup) | Local email/password + JWT (FastAPI) | No Google/GitHub/Facebook/Firebase provider setup; tokens are issued by the local API |
| Database | Firebase Realtime DB | SQLite | Local file database; no managed DB required |
| Data access | AngularFire2 observables | REST API + React Query / SWR | Polling-based live updates; SSE/WebSocket out-of-scope initially |
| Task model | `ITask` (`$key`, `title`, `completed`, `createdAt`) | Equivalent Pydantic/SQLAlchemy schema | Preserve field semantics; replace `$key` with integer `id` |
| Styling | SCSS (component + global) | SCSS via Vite | Reuse existing SCSS variables/mixins where possible |
| Routing guards | `RequireAuthGuard`, `RequireUnauthGuard` | React Router route guards / HOC | Redirect unauthenticated users to `/`; redirect authenticated away from `/` |
| E2E / unit tests | Karma / Protractor | Vitest + React Testing Library + Playwright | Replace legacy test tooling |

---

## 4. Out-of-Scope

- **Real-time push** — Firebase RTDB live sync will be replaced by client-side polling (React Query `refetchInterval`) or manual refresh. SSE/WebSocket upgrades are deferred.
- **External auth providers** — Google/GitHub/Twitter/Facebook/Firebase OAuth setup is removed from the migration target. Local email/password auth is the default and required path.
- **Managed database services** — PostgreSQL, hosted SQL, Firebase RTDB, Supabase, Neon, PlanetScale, and similar services are not required for the target MVP.
- **Firebase hosting / CDN** — No hosted deployment target is required in the migration policy. The deliverable must run locally from source.
- **Legacy data migration (ETL)** — No automated import of existing Firebase tasks. The new database starts fresh. If the user later requests data migration, it will be treated as a separate work-stream.
- **PWA / service worker** — `sw-precache` is dropped. Vite PWA plugin can be reintroduced later if needed.
- **CI/CD pipeline** — CircleCI config will not be migrated initially. Local test commands are required; hosted CI is optional later.

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
   └── requirements.txt
   ```
2. **ORM** — SQLAlchemy 2.x with declarative base. Use SQLite through the standard SQLAlchemy SQLite driver. Async SQLAlchemy is acceptable if it does not add setup friction, but sync SQLAlchemy is preferred for this Todo migration unless downstream stages find a concrete benefit.
3. **Migrations** — Alembic for all schema changes. Initial migration creates `users` and `tasks` tables.
4. **Auth** — Implement local username/email + password authentication in FastAPI. Use password hashing (`passlib`/`bcrypt`) and locally issued JWT access tokens (`python-jose` or equivalent). Do not require OAuth client IDs, OAuth secrets, Firebase projects, Google/GitHub apps, or any browser popup provider.
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
7. **CORS** — Allow local frontend origins explicitly (for example `http://localhost:5173`). Do not require public domains for local development.
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
4. **HTTP client** — Native `fetch` wrapped in a small API layer unless the implementation has a clear reason to add `axios`. Attach JWT `Authorization: Bearer <token>` from the local auth flow.
5. **Routing** — React Router 6 with route guards implemented as wrapper components (`<RequireAuth>`, `<RequireUnauth>`).
6. **TypeScript** — Strict mode enabled. Reuse `ITask` interface shape; rename `$key` → `id`.
7. **Styling** — Keep SCSS. Migrate component-level SCSS files to co-located `*.module.scss` or plain `*.scss` imports. Global grid/settings/base SCSS moves to `src/styles/`.
8. **Forms** — Controlled inputs with native React form handling (no heavy form library needed for two simple forms).

### 5.3 Database

1. **Required database** — SQLite (file-based, zero-config). The app must create/use a local database file without a hosted database account.
2. **Optional future database** — PostgreSQL or another server database may be documented only as a future deployment option, not as a requirement for migration acceptance.
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
- **Local startup** — Provide documented local commands for backend, frontend, migrations/DB initialization, and tests. A helper script or `Makefile` is preferred if it keeps setup simple.

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
| Local operability | Runs fully on one developer machine | No external service accounts, no hosted auth, no managed DB, no cloud runtime required |
| Security | OWASP Top 10 baseline | bcrypt passwords, local JWT signing secret, parameterized queries (SQLAlchemy); HTTPS only if later deployed |
| Test coverage | ≥ 80% backend, ≥ 70% frontend unit | Vitest + pytest |
| Build artifact | Local source build | Frontend static build and backend local server; Docker/container setup is optional, not required |

---

## 10. Assumptions & Inferred Decisions

| # | Decision | Rationale | Classification |
|---|----------|-----------|----------------|
| 1 | SQLite is the required database | User requested no third-party setup and fully local execution. | **Confirmed** |
| 2 | Local email/password + JWT | Replaces Firebase Auth/OAuth popup with code-owned local authentication. No external provider setup. | **Confirmed** |
| 3 | No legacy data migration | Fresh start avoids complex Firebase RTDB → SQL ETL for a demo Todo app. | **Proposed** |
| 4 | React Query for server state | Replaces RxJS/FirebaseListObservable with modern data-fetching patterns. | **Confirmed** (best practice) |
| 5 | SCSS retained | Minimizes UI rework while porting to React. | **Proposed** |
| 6 | Anonymous login dropped | It depended on Firebase Auth semantics and is not required for local email/password MVP. | **Proposed** |
| 7 | No WebSocket/SSE | Polling keeps scope contained; real-time can be added later without breaking API contract. | **Proposed** |
| 8 | No external runtime services | All required parts must run locally from source using installable libraries/frameworks only. | **Confirmed** |

---

## 11. Open Questions

1. **Task ownership scope** — The legacy app uses per-user Firebase paths (`/tasks/{uid}`). Should tasks remain strictly private, or is there any future multi-user/sharing requirement? *(Default: strict per-user isolation.)*
2. **One-command local startup** — Should the implementation require a single helper command (`make dev` or similar), or are separate backend/frontend commands acceptable? *(Default: provide simple documented commands; add helper if practical.)*

---

## 12. Policy Status

`draft` — revised after user feedback requiring local-only execution and no third-party service setup. Awaiting user review before downstream analysis or implementation begins.
