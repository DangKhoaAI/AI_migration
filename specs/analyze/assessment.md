# AS-IS Assessment

## Executive Summary

The legacy app is a compact Angular 4/Firebase Todo SPA with clear domain boundaries: shell, Firebase platform, auth, task data, task UI, and test/build tooling. Migration risk is concentrated less in business complexity and more in platform replacement: Firebase Auth, Firebase Realtime Database, AngularFire observables, Angular Router guards, and outdated Angular CLI tooling are all deeply embedded in the small codebase.

The frozen policy in `transform.md` is broadly consistent with the code. The main policy/code gap is that the legacy app supports anonymous and OAuth popup sign-in only, while the target policy requires local email/password plus JWT and explicitly drops external providers and anonymous login. This is an intentional migration delta already captured by policy, not a Stage 0 blocker.

## Migration Risks

| Risk | Severity | Evidence | Impact |
| --- | --- | --- | --- |
| Firebase dependency is central to auth and data | High | `AuthService`, `TasksService`, `FirebaseModule`, `Task` model timestamp | Replacement requires new auth/session/data-store contracts before task workflows can migrate. |
| Auth behavior changes from provider popup/anonymous to local credentials | High | Sign-in component exposes Anonymous, GitHub, Google, Twitter, Facebook only | User-visible sign-in workflow cannot be ported 1:1 under frozen policy; reverse specs must explicitly record this policy-approved delta. |
| Firebase Realtime Database live list semantics | High | `FirebaseListObservable`, AngularFire list query, implicit live updates | Target polling/REST behavior will differ in freshness, error handling, and loading states. |
| Task ownership is path-based and rule-enforced | High | `/tasks/{uid}` path and `firebase.rules.json` | Target backend must preserve strict user isolation in application queries and database schema. |
| Route filtering uses Angular matrix parameters | Medium | `routerLink=['/tasks', {completed: false}]`, `ActivatedRoute.params.pluck('completed')` | Target policy uses `GET /tasks?completed=...`; frontend route and API filter semantics need careful mapping. |
| Error handling is mostly swallowed | Medium | `AuthService.signIn().catch(error => console.log(...))` | Legacy may navigate after failed sign-in promises if errors are swallowed; target must follow constitution and expose structured errors. |
| Outdated framework/toolchain | High | Angular 4.2.6, Angular CLI 1.2.0, RxJS 5.4.2, Protractor, TSLint | Local install/test may be fragile on modern Node/npm; package audit risk is high. |
| PWA/service worker behavior exists but target excludes it | Low | `postbuild` precache, `src/main.ts` service worker registration | Must be recorded as out of target scope to avoid accidental Stage 3 reintroduction. |
| Hosted deployment exists but target excludes it | Low | Firebase Hosting config and CircleCI deploy | Operational behavior will be replaced by local-only startup docs per policy. |

## Coupling and Boundaries

### Strong Coupling

- `TasksService` depends on `AuthService.uid$` and `AngularFireDatabase`; task data is not usable without authenticated Firebase state.
- `Task` model imports the Firebase namespace solely to set `createdAt` using `firebase.database.ServerValue.TIMESTAMP`, coupling the domain model to the data provider.
- `TaskListComponent` types its `tasks` input as `FirebaseListObservable<ITask[]>`, coupling a presentational component to AngularFire instead of a framework-neutral observable/list type.
- `AppComponent` directly exposes `AuthService` to the template, which is simple but makes shell rendering depend on auth service availability.
- `TasksRoutesModule` imports `RequireAuthGuard` from the auth module, creating an intended feature dependency from tasks to auth.

### Cycles

No hard TypeScript import cycle was detected in the scanned files. There is a runtime provider-order dependency: `AuthService` and `TasksService` require AngularFire providers supplied by `FirebaseModule`, while the root `AppModule` composes all feature modules together.

### Dead or Unused Code

Potentially unused or target-excluded code:

- `import 'rxjs/add/observable/merge';` appears in `TasksService` but no `Observable.merge` usage was found.
- Firebase Hosting, CircleCI deployment, and service-worker precache are active AS-IS operational files but out-of-scope for target MVP.
- `@angular/http` is listed in dependencies but no usage was found under `src/app`.

No broad dead-code scan was run beyond repository text inspection.

## Test Gaps

Existing tests:

- One unit suite for `Task` default title/completion behavior.
- One Protractor smoke test that checks the header title.

Missing coverage:

- No tests for `AuthService` provider login methods, sign-out, or auth observables.
- No tests for route guard redirect behavior.
- No tests for sign-in UI actions or post-sign-in navigation.
- No tests for `TasksService` Firebase path scoping, create/update/delete behavior, or completed filter behavior.
- No tests for `TaskFormComponent`, `TaskListComponent`, or `TaskItemComponent` interactions.
- No tests for Firebase security rules.
- E2E does not cover sign-in, create task, toggle completion, edit title, delete, filtering, or sign-out.

Verification limitation:

- Tests were not executed during this Stage 1 run because `node_modules` is absent. Running the legacy Angular 4 toolchain would require dependency installation and likely Node/npm compatibility work.

## Deprecated and Legacy Libraries

| Dependency/tool | AS-IS version | Risk |
| --- | --- | --- |
| Angular | 4.2.6 | End-of-life, incompatible with modern Angular ecosystem. |
| Angular CLI | 1.2.0 | End-of-life, old Webpack/build assumptions. |
| AngularFire2 | 4.0.0-rc.1 | Release candidate dependency and old Firebase SDK API shape. |
| Firebase JS SDK | 4.1.3 | Very old SDK, legacy namespace API. |
| RxJS | 5.4.2 | Patch-operator style and old observable APIs. |
| TypeScript | 2.4.1 | Very old compiler; no modern strictness defaults. |
| Protractor | 5.1.2 | Deprecated E2E framework. |
| TSLint/Codelyzer | TSLint 5.5.0, Codelyzer 3.1.2 | TSLint ecosystem is deprecated. |
| Karma/Jasmine stack | Karma 1.7, Jasmine 2.6 | Old browser test stack. |
| `sw-precache` | 5.2.0 | Legacy PWA tooling. |
| `core-js` | 2.4.1 | Old polyfill package line. |

## Security and Privacy Observations

- Firebase API key/project metadata is committed in `src/environments/firebase.ts`. This is normal for Firebase web apps but confirms the AS-IS app depends on a specific hosted Firebase project.
- Firebase rules enforce user-level task isolation for reads and writes under `/tasks/{uid}`.
- Auth errors are logged to the browser console and swallowed; this conflicts with the target constitution's explicit error handling requirement.
- CircleCI deploy requires `FIREBASE_TOKEN`; no token value is present in the repo.
- `src/index.html` loads third-party font/icon resources at runtime, creating external browser network dependencies.
- Firebase Hosting sets basic security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-UA-Compatible`, and `X-XSS-Protection`.

## Observability Gaps

- No application-level structured logging exists.
- Errors are only logged ad hoc in `AuthService` and bootstrap catch blocks.
- No trace IDs, user-action audit, API request logs, or persistence diagnostics exist because Firebase abstracts the backend.
- No local health check or runtime readiness signal exists.

## Policy Alignment

Aligned with frozen policy:

- Legacy is Angular + Angular CLI + AngularFire2 + Firebase.
- Legacy task model includes `$key`, `title`, `completed`, and `createdAt`.
- Legacy routes use `/` for sign-in and `/tasks` for the authenticated task page.
- Legacy guards redirect unauthenticated users to `/` and authenticated users to `/tasks`.
- Legacy Firebase rules require per-user ownership.
- Legacy build/deploy/PWA elements are excluded from target MVP by policy.

Policy-approved behavior changes to preserve in downstream specs:

- Anonymous and OAuth provider sign-in will be replaced by local email/password and JWT.
- Firebase Realtime Database live updates will be replaced by REST and polling/manual refresh.
- Firebase `$key` will be replaced by integer `id`.
- Firebase server timestamps will be replaced by backend/database timestamps.
- Firebase Hosting, Firebase CLI deploy, and service worker precache will not be migrated initially.

No Stage 0 blocker was found.

## Open Discoveries

- Confirm whether strict private task ownership remains sufficient for all future users. `transform.md` defaults to strict per-user isolation, but asks whether sharing could appear later.
- Confirm whether target local startup must be one command or may remain separate backend/frontend commands. `transform.md` defaults to documented separate commands with helper if practical.
- Determine in Stage 2 whether failed Firebase sign-in should be treated as legacy-intended navigation failure or as a bug to correct under the constitution.
- Determine in Stage 2 whether task ordering by Firebase insertion/server timestamp should be preserved explicitly in the target API response order.
- Determine in Stage 2 whether route-level task filter UX should remain a URL route concern or become only an API query/UI state concern under the target policy.
