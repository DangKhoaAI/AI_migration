# TO-BE Architecture

## Scope and Policy

This architecture is the first Stage 3 TO-BE projection for the Todo migration.
It is derived from:

- `transform.md` frozen migration policy.
- `constitution.md` engineering constraints.
- `specs/analyze/architecture.md` AS-IS architecture inventory.
- `specs/analyze/assessment.md` migration risk assessment.

Policy mode is `migration`: replace the Angular 4 + Firebase implementation while
preserving the core Todo SPA behavior. Required runtime behavior must work locally
without Firebase, hosted OAuth providers, managed databases, Firebase Hosting, or
other third-party service setup.

After review, this file becomes the project-wide architecture baseline for later
slices. Later slice specs may refine their own implementation details, but should
not silently change this architecture.

## Target System Summary

The target system is a local-first monorepo with a FastAPI backend, a React/Vite
frontend, and a SQLite database.

```text
Browser
  -> frontend/ Vite React SPA
       -> React Router browser routes
       -> React Query server-state cache
       -> fetch-based API client
  -> backend/ FastAPI app
       -> /api/v1 auth endpoints
       -> /api/v1 task endpoints
       -> SQLAlchemy services and repositories
       -> SQLite database through Alembic-managed schema
```

## Repository Layout

```text
backend/
  app/
    main.py
    api/
      v1/
        auth.py
        tasks.py
    core/
      config.py
      errors.py
      logging.py
      security.py
    models/
      user.py
      task.py
    schemas/
      auth.py
      user.py
      task.py
    services/
      auth_service.py
      task_service.py
    dependencies.py
    db.py
  alembic/
  tests/
  requirements.txt

frontend/
  src/
    main.tsx
    App.tsx
    api/
      client.ts
      auth.ts
      tasks.ts
    components/
      Header.tsx
      ErrorBoundary.tsx
    hooks/
    pages/
      SignInPage.tsx
      TasksPage.tsx
    routes/
      RequireAuth.tsx
      RequireUnauth.tsx
      router.tsx
    styles/
      _base.scss
      _grid.scss
      _settings.scss
      styles.scss
    types/
      task.ts
      user.ts
  public/
    favicon.ico
  index.html
  vite.config.ts
  package.json
```

Legacy Angular source may remain in Git history or be moved under `legacy/` during
implementation if a later execution task needs an in-repo reference copy. Runtime
target code lives under `backend/` and `frontend/`.

## Component Inventory

| Component | Status | Target responsibility | AS-IS source |
| --- | --- | --- | --- |
| Frontend Vite shell | new | Build and serve the React SPA with TypeScript strict mode. | Angular CLI shell and root config |
| React app root | refactored | Render global providers, header, route outlet, error boundary, and app layout. | `AppComponent`, `AppModule` |
| Browser document | refactored | Provide root DOM node, title, favicon, viewport metadata, and local asset links. | `src/index.html` |
| Header component | refactored | Show app title, GitHub link, and sign-out affordance based on auth state. | `AppHeaderComponent` |
| Global SCSS | refactored | Preserve reusable base, grid, and settings styles in Vite-compatible SCSS. | `src/styles/*.scss` |
| Feature SCSS | refactored | Co-locate component/page styles as plain SCSS or modules. | Angular component SCSS |
| React Router routes | refactored | Replace Angular Router with BrowserRouter and guarded route wrappers. | `auth.routes.ts`, `tasks.routes.ts` |
| Auth route guards | refactored | Redirect unauthenticated users to `/` and authenticated users away from `/`. | `RequireAuthGuard`, `RequireUnauthGuard` |
| Auth page | refactored | Replace provider buttons with local email/password registration and login. | `SignInComponent` |
| API client | new | Wrap `fetch`, attach JWT bearer token, handle structured errors. | AngularFire service access |
| React Query layer | new | Cache auth/user/task server state and refetch task lists by policy. | RxJS/AngularFire observables |
| FastAPI app | new | Serve local REST API, OpenAPI docs, CORS, error handlers, and request logging. | Firebase BaaS |
| Auth API | new | Register/login local users, issue JWTs, expose current user. | Firebase Auth |
| Task API | new | Provide user-owned task list, create, update, delete, and completed filtering. | Firebase RTDB task list |
| Data model | refactored | Replace Firebase keys/timestamps with SQL rows and database timestamps. | `ITask`, Firebase list records |
| SQLite persistence | new | Store users and tasks locally with SQLAlchemy and Alembic migrations. | Firebase Realtime Database |
| Backend tests | new | pytest coverage for API success/error paths and service behavior. | Sparse Karma/Protractor tests |
| Frontend tests | refactored | Vitest and React Testing Library for app, route, auth, and task UI flows. | Karma/Jasmine tests |
| E2E tests | refactored | Playwright critical path: sign in, create, toggle, delete, sign out. | Protractor smoke test |
| Firebase module/config | dropped/deprecated | Not used in target runtime. | `FirebaseModule`, environment Firebase config |
| Firebase rules/hosting | dropped/deprecated | Replaced by backend authorization and local startup. | `firebase.rules.json`, `firebase.json` |
| PWA precache | dropped/deprecated | Out of target MVP by policy. | `sw-precache.config.js`, service worker hook |
| CircleCI deploy | dropped/deprecated | Hosted CI/CD is out of target MVP. | `circle.yml` |
| Project docs/license | unchanged | Preserve documentation and license, update setup docs during implementation. | `README.md`, `LICENSE` |

## Runtime Boundaries

### Frontend Boundary

The frontend owns browser rendering, route transitions, form state, optimistic or
cached server-state presentation, and user-visible error messages. It does not own
authentication truth, task ownership, or persistence rules.

Frontend code talks to the backend only through `/api/v1` JSON endpoints. JWTs are
attached with `Authorization: Bearer <token>` unless a later implementation serves
the frontend and backend from the same origin and can use httpOnly cookies without
extra setup friction.

### Backend Boundary

The backend owns authentication, authorization, task ownership, validation, error
normalization, and persistence. All request bodies and query parameters pass
through Pydantic schemas. All task queries filter by authenticated `user_id`.

The backend exposes OpenAPI docs through FastAPI's standard local documentation
routes and uses explicit CORS origins for the local frontend development server.

### Data Boundary

SQLite is the required local database. SQLAlchemy is the only persistence access
path. Alembic owns schema changes. The target database starts fresh; automated
Firebase data import is out of scope for the migration MVP.

## Target Interfaces

| Interface | Target owner | Contract |
| --- | --- | --- |
| Browser route `/` | Frontend | Sign-in/register page for unauthenticated users; authenticated users redirect to `/tasks`. |
| Browser route `/tasks` | Frontend | Authenticated task page; unauthenticated users redirect to `/`. |
| Browser route task filter state | Frontend + API | UI may expose active/completed filters; API filter is `GET /api/v1/tasks?completed=true|false`. |
| `POST /api/v1/auth/register` | Backend | Create local user with email/password and return auth/session payload. |
| `POST /api/v1/auth/login` | Backend | Validate credentials and return JWT access token/session payload. |
| `GET /api/v1/users/me` | Backend | Return authenticated user profile. |
| `GET /api/v1/tasks` | Backend | Return current user's tasks sorted by `created_at DESC`; optional `completed` filter. |
| `POST /api/v1/tasks` | Backend | Create an incomplete task for current user. |
| `PUT /api/v1/tasks/{id}` | Backend | Update title and/or completion for a task owned by current user. |
| `DELETE /api/v1/tasks/{id}` | Backend | Delete a task owned by current user. |

## Rule Placement by Tier

| Rule area | Target tier |
| --- | --- |
| Route access and redirects | UI route guards, backed by API 401/403 handling |
| Current auth session truth | Backend JWT validation and `/users/me`; frontend caches derived state |
| Password hashing and token issuing | Backend service/core security |
| Task ownership isolation | Backend service/repository queries and database foreign keys |
| Request validation | Backend Pydantic schemas; frontend forms provide convenience validation only |
| Task filtering | Backend query parameter; frontend routes or controls call the query |
| Task ordering | Backend default sort by `created_at DESC` |
| Error response format | Backend exception handlers; frontend API client maps errors to UI |
| Loading, empty, and failure presentation | Frontend page/components |
| SCSS variables, grid, and base visuals | Frontend styles |
| External provider removal | Policy-level delta applied in auth slice |
| PWA/hosting/CI removal | Policy-level delta applied in platform/test slices |

## Data Model

### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer primary key | Local replacement for Firebase auth uid in DB relations. |
| `email` | string unique | Local login identifier. |
| `hashed_password` | string | bcrypt hash, never returned to the frontend. |
| `created_at` | datetime | Database/server-generated timestamp. |

### Task

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer primary key | Replaces Firebase `$key`. |
| `user_id` | integer foreign key | Enforces per-user ownership with backend query filters. |
| `title` | string | User-entered title. Whitespace-only titles are rejected. |
| `completed` | boolean | New tasks default to `false`. |
| `created_at` | datetime | Replaces Firebase server timestamp sentinel. |

Required indexes:

- `tasks(user_id, completed)`
- `tasks(user_id, created_at)`

## Cross-Cutting Requirements

| Area | Target requirement |
| --- | --- |
| Local operability | Backend, frontend, and SQLite database run from local source with no cloud accounts. |
| Accessibility | Preserve keyboard navigation and reach WCAG 2.1 AA for migrated UI. |
| Security | bcrypt cost factor at least 12, short-lived JWTs, no password/token logging, no wildcard CORS default. |
| Error handling | API errors use structured JSON; frontend surfaces actionable errors and redirects on 401. |
| Logging | Backend request logs include trace IDs and avoid PII/secrets. |
| Testing | pytest backend, Vitest/RTL frontend, Playwright E2E critical path. |
| Performance | Frontend first paint target under 1.5s on 3G; response payloads remain small. |
| Type safety | Strict TypeScript frontend, Pydantic v2 backend schemas, SQLAlchemy typed models. |

## Slice Mapping

| Slice | Target component focus |
| --- | --- |
| `s001-platform-shell-and-styles` | Vite frontend shell, `index.html`, root React app, header, global SCSS, asset handling, package/build config, removal of PWA hook from target MVP. |
| `s002-firebase-platform-and-security-rules` | Backend local platform, SQLite config, CORS, auth/task authorization rules replacing Firebase config and rules. |
| `s003-authentication-and-route-access` | Local auth API, JWT handling, React auth page, auth state, and guarded routes. |
| `s004-task-data-model-and-service` | SQLAlchemy/Pydantic task model, task API service, task ownership, CRUD/filter behavior. |
| `s005-task-ui-workflow` | React task page, form, list, item editing, completion toggles, deletion, focus behavior, and task filter controls. |
| `s006-test-and-quality-harness` | pytest, Vitest, React Testing Library, Playwright, linting, and local verification commands. |

## Explicit Target Exclusions

These AS-IS elements are not target runtime components unless a future Stage 0
policy update reopens them:

- Firebase Auth providers, Firebase Realtime Database, AngularFire, Firebase
  Hosting, Firebase CLI deployment, and Firebase project configuration.
- Anonymous login and hosted OAuth popup providers.
- `sw-precache` service worker/PWA behavior.
- CircleCI hosted deployment.
- Automated Firebase data migration.
- SSE/WebSocket realtime push; polling or manual refresh is the target baseline.

## Open Architecture Questions

The frozen policy already defines defaults for these, so implementation should
proceed with the defaults unless the user reopens policy:

1. Task ownership remains strictly private per user.
2. Separate backend/frontend startup commands are acceptable, with a helper script
   or `Makefile` preferred if it keeps setup simple.
