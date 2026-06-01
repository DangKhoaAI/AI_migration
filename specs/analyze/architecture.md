# AS-IS Architecture

## Scope Source

Stage 1 analysis is based on the frozen migration policy in `transform.md` and the engineering constraints in `constitution.md`.

The legacy system in scope is a Todo single-page application implemented with Angular 4, Angular CLI 1.x, AngularFire2, Firebase Authentication, and Firebase Realtime Database. The policy excludes Firebase hosting, Firebase/Auth provider setup, legacy ETL, PWA/service worker migration, and CI/CD migration from the target MVP, but those legacy elements are still inventoried here because they affect the AS-IS system.

## Languages and Frameworks

| Area | AS-IS technology | Evidence |
| --- | --- | --- |
| Frontend language | TypeScript 2.4.1, HTML templates, SCSS | `package.json`, `src/app/**/*.ts`, `src/styles/*.scss` |
| SPA framework | Angular 4.2.6 | `package.json`, `src/app/app.module.ts` |
| Build tooling | Angular CLI 1.2.0, Webpack through Angular CLI | `.angular-cli.json`, `package.json` scripts |
| Routing | Angular Router 4 with browser history (`useHash: false`) | `src/app/app.module.ts`, `src/app/auth/auth.routes.ts`, `src/app/tasks/tasks.routes.ts` |
| Forms | Angular template-driven forms | `FormsModule`, `[(ngModel)]` in task components |
| State and async | RxJS 5 patch operators, Observables, ReplaySubject | `auth.service.ts`, `tasks.service.ts`, route guards |
| Backend/data service | Firebase Auth and Firebase Realtime Database via AngularFire2 | `src/app/firebase/firebase.module.ts`, `src/app/auth/auth.service.ts`, `src/app/tasks/tasks.service.ts` |
| Styling | Global SCSS and component SCSS, `minx`, external icon/font styles | `src/styles/styles.scss`, component `.scss`, `src/index.html` |
| Unit testing | Karma + Jasmine | `karma.conf.js`, `src/test.ts`, `src/app/tasks/models/task.spec.ts` |
| E2E testing | Protractor + Jasmine | `protractor.conf.js`, `e2e/*.ts` |
| Hosting/deploy | Firebase Hosting and CircleCI deploy to Firebase | `firebase.json`, `.firebaserc`, `circle.yml` |
| PWA precache | `sw-precache` generated after production build | `package.json`, `sw-precache.config.js`, `src/main.ts` |

## Runtime Entry Points

| Entry point | Purpose |
| --- | --- |
| `src/index.html` | Browser document shell, `<app-root>`, base href `/`, external Google Material Icons, Font Awesome, and Typekit resources. |
| `src/main.ts` | Enables Angular production mode, bootstraps `AppModule`, and registers `/service-worker.js` in production if supported. |
| `src/app/app.module.ts` | Root Angular module. Imports `BrowserModule`, root router, `AuthModule`, `FirebaseModule`, and `TasksModule`; bootstraps `AppComponent`. |
| `src/app/app.component.ts` | Root component. Renders `AppHeaderComponent` and `router-outlet`; binds header auth state and sign-out to `AuthService`. |
| `src/app/auth/auth.routes.ts` | Route `''` renders sign-in page behind `RequireUnauthGuard`. |
| `src/app/tasks/tasks.routes.ts` | Route `/tasks` renders task page behind `RequireAuthGuard`. |
| `firebase.json` | Firebase Hosting rewrite sends all paths to `/index.html`; database rules point to `firebase.rules.json`. |
| `circle.yml` | CI entry point builds with Node 8.1 and deploys Firebase on `master`. |

## Module Inventory and Boundaries

### Application Shell

Files:

- `src/app/app.module.ts`
- `src/app/app.component.ts`
- `src/app/app-header.component.ts`
- `src/main.ts`
- `src/index.html`
- `src/polyfills.ts`
- `src/test.ts`

Responsibilities:

- Bootstraps Angular into the browser document.
- Defines root router infrastructure and imports feature modules.
- Renders the header and active routed page.
- Shows sign-out only when `AuthService.authenticated$` emits `true`.
- Registers the generated service worker in production.

Boundary notes:

- The shell depends directly on `AuthService` for auth state and sign-out.
- The shell imports `AuthModule`, `FirebaseModule`, and `TasksModule`; it does not own task data or sign-in behavior.

### Firebase Integration

Files:

- `src/app/firebase/firebase.module.ts`
- `src/app/firebase/index.ts`
- `src/environments/firebase.ts`
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `firebase.rules.json`
- `firebase.json`
- `.firebaserc`

Responsibilities:

- Initializes AngularFire with Firebase project config.
- Provides AngularFire Auth and Realtime Database modules to the Angular dependency injector.
- Exports the Firebase namespace used by auth and task model code.
- Defines Realtime Database access rules under `/tasks/{uid}`.
- Defines Firebase Hosting headers and SPA rewrites.

Boundary notes:

- This is the only data-store integration in the AS-IS app.
- Auth and task modules both depend on this module, directly or indirectly.
- `firebase.rules.json` enforces the key ownership invariant: a signed-in user may only read/write `/tasks/{auth.uid}`.

### Authentication

Files:

- `src/app/auth/auth.module.ts`
- `src/app/auth/auth.routes.ts`
- `src/app/auth/auth.service.ts`
- `src/app/auth/components/sign-in/sign-in.component.ts`
- `src/app/auth/components/sign-in/sign-in.component.scss`
- `src/app/auth/guards/require-auth.guard.ts`
- `src/app/auth/guards/require-unauth.guard.ts`
- `src/app/auth/index.ts`
- `src/app/auth/**/index.ts`

Responsibilities:

- Observes Firebase authentication state.
- Exposes `authenticated$` and `uid$` as RxJS observables.
- Supports anonymous, GitHub, Google, Twitter, and Facebook sign-in through Firebase Auth popup/provider APIs.
- Signs out through Firebase Auth.
- Redirects unauthenticated users away from `/tasks` to `/`.
- Redirects authenticated users away from `/` to `/tasks`.

Boundary notes:

- Auth owns route access decisions.
- Task data depends on `uid$` to choose the Firebase database path.
- Sign-in UI does not handle local credentials; all identity behavior delegates to Firebase Auth.

### Tasks Domain

Files:

- `src/app/tasks/tasks.module.ts`
- `src/app/tasks/tasks.routes.ts`
- `src/app/tasks/tasks.service.ts`
- `src/app/tasks/components/tasks/tasks.component.ts`
- `src/app/tasks/components/task-form/task-form.component.ts`
- `src/app/tasks/components/task-list/task-list.component.ts`
- `src/app/tasks/components/task-item/task-item.component.ts`
- `src/app/tasks/components/task-item/task-item.component.html`
- `src/app/tasks/components/**/*.scss`
- `src/app/tasks/directives/auto-focus.directive.ts`
- `src/app/tasks/models/task.ts`
- `src/app/tasks/models/task.spec.ts`
- `src/app/tasks/index.ts`
- `src/app/tasks/**/index.ts`

Responsibilities:

- Defines the `ITask` shape: `$key`, `title`, `completed`, `createdAt`.
- Creates `Task` instances with `completed = false` and Firebase server timestamp.
- Reads/writes Firebase lists at `/tasks/{uid}`.
- Filters visible tasks by the `completed` route matrix parameter.
- Supports create, update title, toggle completion, and delete.
- Provides route-level task page and component-level task form/list/item UI.
- Uses `AutoFocusDirective` when editing task titles.

Boundary notes:

- Task persistence depends on both `AngularFireDatabase` and `AuthService.uid$`.
- `TasksComponent` coordinates route filter state with `TasksService.filterTasks`.
- Task child components are mostly presentational and emit actions upward.

### Styling and Assets

Files:

- `src/styles/_base.scss`
- `src/styles/_grid.scss`
- `src/styles/_settings.scss`
- `src/styles/styles.scss`
- component `.scss` files under `src/app`
- `src/assets/favicon.ico`
- external styles/scripts referenced by `src/index.html`

Responsibilities:

- Global reset/base/grid styles.
- Component-local visual styling.
- External icon and font resources.

Boundary notes:

- Styles are shared through global SCSS imports and component stylesheets.
- External font/icon dependencies are runtime network integrations from the browser.

### Test and Quality Harness

Files:

- `karma.conf.js`
- `protractor.conf.js`
- `tslint.json`
- `src/test.ts`
- `src/tsconfig.spec.json`
- `e2e/tsconfig.e2e.json`
- `e2e/app.e2e-spec.ts`
- `e2e/app.po.ts`
- `src/app/tasks/models/task.spec.ts`

Responsibilities:

- Configures Jasmine/Karma unit tests and Jasmine/Protractor E2E tests.
- Provides a single model unit test suite for `Task`.
- Provides a single E2E smoke check for the application header title.
- Configures TypeScript linting through TSLint/Codelyzer.

Boundary notes:

- Existing tests do not isolate Firebase services or exercise auth/task workflows.
- E2E tests require the Angular dev server at `http://localhost:4200/`.

### Build, Deployment, and PWA

Files:

- `package.json`
- `package-lock.json`
- `.angular-cli.json`
- `tsconfig.json`
- `src/tsconfig.app.json`
- `sw-precache.config.js`
- `firebase.json`
- `circle.yml`

Responsibilities:

- Defines local scripts: `npm start`, `npm run build`, `npm run lint`, `npm test`, `npm run e2e`.
- Builds production assets to `dist`.
- Runs `sw-precache` after build.
- Configures Firebase Hosting headers, rewrites, and CircleCI deployment.

Boundary notes:

- Build and deploy are tightly coupled to the legacy Angular CLI/Firebase setup.
- PWA/service worker and hosted deploy are out of target scope per `transform.md`, but part of AS-IS behavior.

## Data Stores

### Firebase Realtime Database

Primary path:

```text
/tasks/{uid}/{taskKey}
```

Observed task shape:

| Field | Type/semantics |
| --- | --- |
| `$key` | Firebase list key supplied by AngularFire. |
| `title` | User-entered task title. Whitespace-only creates are rejected in UI. |
| `completed` | Boolean completion status; new tasks default to `false`. |
| `createdAt` | Firebase server timestamp sentinel set by `firebase.database.ServerValue.TIMESTAMP`. |

Access rules:

- Read and write require `auth !== null`.
- `auth.uid` must match the `$uid` path segment.
- The `completed` child is indexed for filter queries.

### Firebase Authentication

Identity providers:

- Anonymous
- GitHub
- Google
- Twitter
- Facebook

Auth state is consumed as:

- `authenticated$`: boolean observable derived from `afAuth.authState`.
- `uid$`: string observable derived from `afAuth.authState`.

## External Integrations

| Integration | Purpose | AS-IS evidence |
| --- | --- | --- |
| Firebase Auth | Hosted auth and provider popup flows | `AuthService`, `SignInComponent` |
| Firebase Realtime Database | Task persistence and filter query | `TasksService`, `firebase.rules.json` |
| Firebase Hosting | Static hosting, headers, rewrites | `firebase.json`, `.firebaserc` |
| Firebase CLI token | CircleCI deployment credential | `circle.yml` |
| Google Material Icons | Icon font for task controls | `src/index.html`, task item template |
| Font Awesome CDN | Header GitHub icon styling | `src/index.html`, header styles |
| Typekit | Typography | `src/index.html` |
| CircleCI | Build/deploy automation | `circle.yml` |
| npm registry and GitHub dependency | Package install, including `minx` from `r-park/minx.git` | `package.json`, `package-lock.json` |

## Dependency Map

No code graph artifact was present in the repository. The dependency map below is derived from imports, route declarations, Angular module metadata, and config files.

```text
Browser
  -> src/index.html
  -> src/main.ts
  -> AppModule
       -> BrowserModule
       -> RouterModule.forRoot([], useHash: false)
       -> AuthModule
            -> AuthRoutesModule
            -> SignInComponent
            -> AuthService
                 -> AngularFireAuth
                 -> firebase namespace
            -> RequireAuthGuard
                 -> AuthService
                 -> Router
            -> RequireUnauthGuard
                 -> AuthService
                 -> Router
       -> FirebaseModule
            -> AngularFireModule.initializeApp(environment.firebase)
            -> AngularFireAuthModule
            -> AngularFireDatabaseModule
       -> TasksModule
            -> TasksRoutesModule
                 -> RequireAuthGuard
            -> TasksComponent
                 -> ActivatedRoute params
                 -> TasksService
            -> TasksService
                 -> AngularFireDatabase
                 -> AuthService.uid$
                 -> Task model
            -> TaskFormComponent
            -> TaskListComponent
                 -> TaskItemComponent
            -> AutoFocusDirective
```

Cross-module dependencies:

| From | To | Reason |
| --- | --- | --- |
| `AppModule` | `AuthModule`, `FirebaseModule`, `TasksModule` | Root composition. |
| `AppComponent` | `AuthService` | Header auth state and sign-out. |
| `AuthModule` | `FirebaseModule` providers | `AuthService` requires `AngularFireAuth` from the injector. |
| `AuthService` | `src/app/firebase/index.ts` | Uses Firebase provider classes and promise types. |
| `TasksRoutesModule` | `RequireAuthGuard` | Protects `/tasks`. |
| `TasksService` | `AuthService` | Reads `uid$` to scope database path. |
| `TasksService` | `FirebaseModule` providers | Requires `AngularFireDatabase` from the injector. |
| `Task` model | `firebase` namespace | Uses Firebase server timestamp sentinel. |
| `TaskListComponent` | `ITask` model and AngularFire type | Receives `FirebaseListObservable<ITask[]>`. |
| `TaskItemComponent` | `ITask` model | Displays and mutates one task. |

## Module-to-Slice Assignment

| Module/file group | Slice |
| --- | --- |
| Root Angular bootstrap, app shell, header, HTML, polyfills | `s001-platform-shell-and-styles` |
| Global/component styles and assets | `s001-platform-shell-and-styles` |
| Angular CLI, TypeScript config, package scripts, lockfile, PWA config | `s001-platform-shell-and-styles` |
| Firebase module, environment Firebase config, Firebase rules/hosting metadata | `s002-firebase-platform-and-security-rules` |
| Auth module, sign-in page, auth service, auth route guards | `s003-authentication-and-route-access` |
| Task model, Firebase task service, task CRUD/filter behavior | `s004-task-data-model-and-service` |
| Task page, form, list, item, edit directive, task route UI | `s005-task-ui-workflow` |
| Karma, Protractor, TSLint, unit/e2e test files | `s006-test-and-quality-harness` |

Out of scope for migration implementation but retained as reference:

- `README.md`, `LICENSE`, `transform.md`, and `constitution.md` are documentation/policy artifacts rather than runtime modules.
- Firebase Hosting deployment and CircleCI are out of target MVP per `transform.md`; they remain assigned to discovery slices because they describe AS-IS operations.
