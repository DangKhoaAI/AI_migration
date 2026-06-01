# TO-BE Specification: s001-platform-shell-and-styles

## Stage 3 Summary

Policy mode is `migration`.

This slice projects the Angular/Firebase platform shell and style baseline into the target React/Vite frontend shell defined by `transform.md` and the project-wide TO-BE `architecture.md`.

The target keeps the product shell intent: a Todo SPA browser document, one root app mount, app header, routed main content area, global styling, favicon, and local build entry points. It replaces Angular CLI, Angular runtime bootstrap, Angular module composition, Zone.js/polyfill assumptions, Firebase module composition in the shell, Typekit/Font Awesome runtime dependencies, and `sw-precache` service-worker generation where the frozen policy requires local-first React/Vite behavior.

## Inputs

| Input | Version consumed |
| --- | --- |
| AS-IS spec | `specs/s001-platform-shell-and-styles/a-spec.md` from commit `b001f3a59afea17c50355fce9c7b4348c094b9c9` |
| Transformation policy | `transform.md`, status `frozen`, mode `migration` |
| AS-IS architecture | `specs/analyze/architecture.md` |
| TO-BE architecture baseline | `architecture.md` from commit `c14f07844541e579cb56d7efaacc35237a93e892` |
| Engineering constitution | `constitution.md` |

## Target Scope

### In Scope

- `frontend/index.html` browser document.
- `frontend/src/main.tsx` React/Vite runtime entry point.
- `frontend/src/App.tsx` root shell, global providers, header placement, and routed content outlet.
- `frontend/src/components/Header.tsx`.
- Header and app shell SCSS, either as co-located modules or plain SCSS imports following the frontend convention chosen during implementation.
- `frontend/src/styles/_base.scss`, `_grid.scss`, `_settings.scss`, and `styles.scss`.
- `frontend/public/favicon.ico`.
- `frontend/vite.config.ts`, frontend TypeScript configs, frontend package metadata, and local shell/build scripts.
- Removal from the target MVP of Angular CLI shell behavior, Angular-specific polyfills, `minx` as a required runtime/build dependency, and `sw-precache` service-worker generation.

### Out of Scope for This Slice

- Local auth API, JWT issuing, login/register form behavior, and route guard truth. These are owned by `s003-authentication-and-route-access`.
- Firebase platform replacement, CORS, backend config, and authorization rules. These are owned by `s002-firebase-platform-and-security-rules`.
- Task model, task API, and task CRUD/filter behavior. These are owned by `s004-task-data-model-and-service` and `s005-task-ui-workflow`.
- Vitest/RTL/Playwright harness implementation. The shell must be testable, but the full test harness belongs to `s006-test-and-quality-harness`.

## Target Component and File Mapping

| AS-IS module | Target equivalent | Status | Notes |
| --- | --- | --- | --- |
| `src/index.html` | `frontend/index.html` | refactored | Keeps base app document, title, favicon, and root mount; replaces `<app-root>` with a React root element. |
| `src/main.ts` | `frontend/src/main.tsx` | refactored | Replaces Angular bootstrap with React 18 `createRoot` and Vite environment handling. |
| `src/polyfills.ts` | Vite/browser compatibility config if needed | dropped/refactored | Zone.js and Angular reflect polyfills are not target runtime dependencies. |
| `src/test.ts` | Vitest setup in `s006` | refactored/deferred | Test bootstrap moves out of the shell slice. |
| `src/app/app.module.ts` | `frontend/src/App.tsx`, `frontend/src/routes/router.tsx`, provider setup | refactored | Angular modules become React composition and route configuration. |
| `src/app/app.component.ts` | `frontend/src/App.tsx` | refactored | Keeps header before routed content and app main layout. |
| `src/app/app.component.scss` | `frontend/src/App.scss` or `app.module.scss` | refactored | Keeps main content spacing. |
| `src/app/app-header.component.ts` | `frontend/src/components/Header.tsx` | refactored | Keeps title, GitHub link, authenticated sign-out affordance, and callback interface. |
| `src/app/app-header.component.scss` | `frontend/src/components/header.module.scss` or equivalent | refactored | Ports layout and icon/link styles to local SCSS/CSS. |
| `src/styles/*.scss` | `frontend/src/styles/*.scss` | refactored | Preserves reusable settings, base, and grid styles under Vite. |
| `src/assets/favicon.ico` | `frontend/public/favicon.ico` | unchanged/refactored | Same asset, served by Vite public assets. |
| `.angular-cli.json` | `frontend/vite.config.ts`, TS configs, package scripts | replaced | Angular CLI project config is not retained. |
| `package.json`, `package-lock.json` | `frontend/package.json`, lockfile, optional root helper scripts | replaced/refactored | Uses React/Vite dependencies and scripts. |
| `tsconfig.json`, `src/tsconfig.app.json` | frontend TypeScript configs | replaced/refactored | Strict TypeScript target; no Angular decorator metadata requirement. |
| `sw-precache.config.js` | none in MVP | dropped | PWA/service worker is out of scope by policy. |

## Interface Mapping

### Browser Document

| AS-IS interface | Target interface | Trace |
| --- | --- | --- |
| Base href `/` and browser-history routing | `frontend/index.html` keeps app-root relative routing for React Router BrowserRouter. | `AS-R002`, `AS-R016` |
| Viewport disables user scaling | Target viewport keeps responsive width/initial scale but must not disable user zoom. | `AS-R003`, `D-S001-006` |
| Document title `Todo Angular Firebase` | Preserve the title text unless a later product policy update renames the app. | `AS-R004`, `AS-R026` |
| External Material Icons, Font Awesome, and Typekit URLs | Target shell must not require third-party runtime font/icon URLs for core rendering. Use local assets, CSS, Unicode/text labels, installed icon packages, or system font fallbacks. | `AS-R005`, `AS-R007`, `D-S001-005` |
| Favicon from `assets/favicon.ico` | Serve the favicon from `frontend/public/favicon.ico`. | `AS-R006`, `AS-R053` |
| `<app-root>` Angular mount | Replace with a single React root element, for example `<div id="root"></div>`. | `AS-R008`, `D-S001-001` |

### Runtime Bootstrap

| AS-IS interface | Target interface | Trace |
| --- | --- | --- |
| `platformBrowserDynamic().bootstrapModule(AppModule)` | `ReactDOM.createRoot(root).render(<App />)` through `frontend/src/main.tsx`. | `AS-R010`, `D-S001-001` |
| `environment.production` controls Angular production mode | Vite mode/build flags replace Angular production-mode handling. | `AS-R009`, `AS-R055`, `D-S001-012` |
| Bootstrap errors logged to `console.error` | Render failures are caught by a React `ErrorBoundary`; startup failures may log in development but must not silently swallow user-visible failures. | `AS-R013`, `D-S001-007` |
| Production service-worker registration | No service worker is registered in the target MVP. | `AS-R011`, `AS-R012`, `AS-R054`, `D-S001-004` |

### Root Shell

| AS-IS interface | Target interface | Trace |
| --- | --- | --- |
| `AppModule` bootstraps `AppComponent` | `main.tsx` renders the React app root. | `AS-R014`, `D-S001-001` |
| `AppModule` declares only app/header shell components in this slice | This slice owns `App.tsx` and `Header.tsx`; feature pages/providers are mounted through cross-slice interfaces. | `AS-R015`, `D-S001-002` |
| Root router has no shell-owned feature routes and uses `useHash: false` | React Router 6 BrowserRouter is used. Feature route modules provide page routes; shell owns layout/outlet only. | `AS-R016`, `D-S001-002` |
| Shell imports auth, Firebase, and task modules | Shell composes target providers/routes but does not import Firebase runtime modules. Auth/task behavior is supplied by later slices. | `AS-R017`, `D-S001-003` |
| Root component renders header before routed outlet | `App.tsx` renders `<Header />` before `<main className="main"><Outlet /></main>` or an equivalent route outlet. | `AS-R019`, `AS-R022` |
| Header authenticated state comes from `AuthService.authenticated$` | Header receives a boolean authenticated state from the target auth context/hook owned by `s003`. | `AS-R020`, `AS-R023`, `D-S001-002` |
| Header sign-out delegates to `AuthService.signOut()` | Header invokes an `onSignOut` callback whose implementation is provided by the auth slice. | `AS-R021`, `AS-R025` |

### Header UI

| AS-IS interface | Target interface | Trace |
| --- | --- | --- |
| OnPush header component | Header is a pure React function component and may use memoization if needed. | `AS-R024` |
| `authenticated` boolean input | Header accepts `authenticated: boolean`. | `AS-R025` |
| `signOut` event output | Header accepts `onSignOut: () => void`. | `AS-R025`, `AS-R028`, `D-S001-008` |
| Title `Todo Angular Firebase` | Preserve visible title text unless policy is updated. | `AS-R026` |
| Sign-out link shown only when authenticated | Render sign-out control only when `authenticated` is true. | `AS-R027` |
| Sign-out anchor has `href="#"` and emits event | Use a button or accessible link handler that does not cause hash navigation. | `AS-R028`, `D-S001-008` |
| GitHub link always rendered | Preserve the upstream GitHub link unless product policy changes it. | `AS-R029` |

### Styles and Assets

| AS-IS interface | Target interface | Trace |
| --- | --- | --- |
| Global SCSS is loaded once by Angular CLI | Import global SCSS once from the Vite React entry point or root app. | `AS-R034`, `D-S001-001` |
| Base, settings, and grid SCSS | Port settings, base, and grid partials into `frontend/src/styles/`. | `AS-R034`, `AS-R037`, `AS-R038` |
| `minx` reset/elements and mixins | Replace required `minx` dependency with local CSS/SCSS equivalents or Vite-compatible installed packages. | `AS-R034`, `AS-R044`, `D-S001-009` |
| `[hidden]` forced hidden | Preserve `[hidden] { display: none !important; }` unless component-specific accessibility work in later slices supersedes it. | `AS-R035` |
| Text selection color | Preserve the selection color token. | `AS-R036` |
| Dark background, gray text, font stack, base size, line height, grid max width | Preserve the visual values with system font fallback and no Typekit requirement. | `AS-R037`, `D-S001-005` |
| Main area 90px bottom padding | Preserve the bottom padding in the root shell style. | `AS-R030` |
| Header height, padding, line-height, right-floated links, separators, and icon styling | Preserve layout intent in local SCSS; icon implementation may change. | `AS-R031`, `AS-R032`, `AS-R033`, `D-S001-005` |

### Build and Package

| AS-IS interface | Target interface | Trace |
| --- | --- | --- |
| Angular CLI project config with `src`, `dist`, assets, entry files, SCSS default | Vite config defines React plugin, frontend root, public assets, SCSS handling, and build output. | `AS-R039`, `D-S001-011` |
| Angular CLI lint/test config pointers | ESLint/Vitest/Playwright config is introduced in `s006`; shell must not depend on Angular CLI config. | `AS-R040`, `D-S001-010` |
| npm scripts for Angular build/start/test/e2e/lint/precache | Frontend scripts use Vite for dev/build/preview; test/lint scripts align with `s006`; no postbuild precache. | `AS-R041`, `AS-R042`, `D-S001-004`, `D-S001-011` |
| Angular/Firebase/RxJS/Zone dependencies | React/Vite/React Router/React Query dependencies replace Angular runtime dependencies per policy. | `AS-R043`, `D-S001-001`, `D-S001-009` |
| Angular CLI, TypeScript 2.4, `minx`, `sw-precache` dev dependencies | Vite, TypeScript strict-mode compatible tooling, ESLint/Prettier/Vitest/Playwright replace legacy tooling by slice ownership. | `AS-R044`, `D-S001-009`, `D-S001-010`, `D-S001-011` |
| ES5/decorator metadata TypeScript config | Modern strict TypeScript config; no Angular decorator metadata. | `AS-R045`, `D-S001-009` |
| App build excludes tests | Production frontend build excludes test files through Vite/Vitest conventions. | `AS-R046`, `D-S001-010` |
| `package-lock.json` v1 pins Angular CLI | Target lockfile reflects chosen package manager and React/Vite dependency graph. | `AS-R052`, `D-S001-011` |

## Rule Placement by Tier

| Target tier | Rule placement |
| --- | --- |
| UI/frontend shell | `TB-S001-R001` through `TB-S001-R034`, `TB-S001-R037` through `TB-S001-R043`. Browser document, React bootstrap, root shell, header props/callbacks, route outlet, styles, assets, frontend build config, and local accessibility/performance behavior. |
| Backend | None in this slice. Backend auth, users, tasks, CORS, logging, and data rules are owned by later slices. |
| BFF/API client | No business logic in this slice. A fetch API client may be scaffolded later by auth/task slices following the project architecture. |
| Worker | None. The AS-IS service worker and `sw-precache` behavior are dropped for the target MVP by policy. |
| Data layer | None. This slice has no persistent domain entity or database table. |
| Cross-slice contract | Authenticated state and sign-out are consumed as UI contracts from `s003`; route page implementations are supplied by `s003` and `s005`; test harness details are supplied by `s006`. |

## Data Model Mapping

This slice has no target database table and no persistent domain model.

| AS-IS data-bearing contract | Target mapping | Trace |
| --- | --- | --- |
| Document metadata: title, base href, viewport, favicon, root mount | `frontend/index.html` metadata and root element. | `AS-R002` through `AS-R008` |
| `AppHeaderComponent.authenticated` | `Header` prop or auth-derived selector: `authenticated: boolean`. | `AS-R020`, `AS-R025`, `AS-R027` |
| `AppHeaderComponent.signOut` event | `Header` callback prop: `onSignOut: () => void`. | `AS-R021`, `AS-R025`, `AS-R028` |
| SCSS tokens: colors, font family, font size, line height, grid width | SCSS variables or CSS custom properties in `frontend/src/styles/_settings.scss`. | `AS-R037` |
| Grid helpers `.g-row` and `.g-col` | Preserve class helpers or provide equivalent utilities with the same layout effect. | `AS-R038` |
| Angular CLI project/build metadata | Vite, TypeScript, package, and local script config. | `AS-R039` through `AS-R046`, `AS-R052` |
| Service-worker generation config | No target data/config artifact in MVP. | `AS-R049` through `AS-R051`, `D-S001-004` |

## Deltas vs. AS-IS

| Delta ID | Type | AS-IS rules affected | Target behavior | Policy justification |
| --- | --- | --- | --- | --- |
| `D-S001-001` | replaced | `AS-R008` through `AS-R015`, `AS-R034`, `AS-R039`, `AS-R043` | Angular runtime/bootstrap/CLI shell is replaced by React 18, Vite, and TypeScript. | `transform.md` sections 3, 5.2.1, 5.2.2, 5.2.6, and 6. |
| `D-S001-002` | reshaped | `AS-R016`, `AS-R017`, `AS-R020`, `AS-R023` | Angular module/router composition becomes React Router 6, app/provider composition, and hook/context state consumption. | `transform.md` sections 3, 5.2.2, 5.2.3, and 5.2.5. |
| `D-S001-003` | dropped/reshaped | `AS-R017`, `AS-R043` | The shell no longer imports Firebase runtime modules. Firebase behavior is replaced by local backend/auth/task slices. | `transform.md` sections 1, 2, 3, 4, 5.1, and 5.3. |
| `D-S001-004` | dropped | `AS-R011`, `AS-R012`, `AS-R042`, `AS-R049`, `AS-R050`, `AS-R051`, `AS-R054` | No service worker, `sw-precache`, or postbuild precache step in the MVP. | `transform.md` section 4 "PWA / service worker" and section 12 frozen policy. |
| `D-S001-005` | reshaped | `AS-R005`, `AS-R007`, `AS-R032`, `AS-R037`, `AS-OQ003` | Core shell rendering must not require external runtime font/icon/Typekit URLs; local/system equivalents are acceptable. | `transform.md` sections 2, 5.2.7, and 9 local operability/performance. |
| `D-S001-006` | reshaped | `AS-R003` | The target viewport must allow user scaling to meet accessibility expectations. | `transform.md` section 9 accessibility target and `constitution.md` section 1 accessibility requirement. |
| `D-S001-007` | reshaped | `AS-R007`, `AS-R013` | Target shell uses explicit render error handling through an ErrorBoundary and does not rely on swallowed errors for user-facing failures. | `transform.md` section 8 frontend error handling and `constitution.md` section 2. |
| `D-S001-008` | reshaped | `AS-R028`, `AS-OQ002` | Header sign-out becomes an accessible button/callback control and does not navigate to `#`. | `transform.md` section 5.2.2 component migration and section 9 accessibility. |
| `D-S001-009` | replaced/dropped | `AS-R043`, `AS-R044`, `AS-R045`, `AS-R047` | Angular, AngularFire, RxJS patch operators, Zone.js, Angular reflect polyfills, Angular decorators, `minx`, and old TypeScript are not target shell dependencies. | `transform.md` sections 3, 5.2.1, 5.2.6, 5.2.7, and 6. |
| `D-S001-010` | moved | `AS-R040`, `AS-R048` | Angular/Karma test bootstrap is replaced by the Stage 6 Vitest/RTL/Playwright harness. | `transform.md` sections 3 and 9 test coverage; slice mapping in `architecture.md`. |
| `D-S001-011` | replaced | `AS-R039`, `AS-R041`, `AS-R042`, `AS-R052` | Angular CLI config and npm scripts become Vite/frontend scripts and lockfile; no Firebase/PWA build post-step. | `transform.md` sections 3, 4, 5.2.1, 6, and 9 local startup/build artifact. |
| `D-S001-012` | reshaped | `AS-R009`, `AS-R055`, `AS-OQ001` | Angular environment production import becomes Vite mode/config; environment ownership does not block this slice. | `transform.md` sections 5.2.1, 6, and 9 local operability. |

## TO-BE Rules

| TO-BE rule ID | Tier | Rule | Trace |
| --- | --- | --- | --- |
| `TB-S001-R001` | UI | The slice remains the platform shell/styles baseline and may be implemented before feature/auth/task slices by relying on typed cross-slice UI contracts. | `AS-R001` |
| `TB-S001-R002` | UI | Target frontend shell files live under `frontend/` following the React/Vite layout in `architecture.md`. | `AS-R039`, `D-S001-001`, `D-S001-011` |
| `TB-S001-R003` | UI | Browser routing remains root-relative and non-hash-based. | `AS-R002`, `AS-R016` |
| `TB-S001-R004` | UI | The viewport keeps responsive device-width behavior but must not disable user zoom. | `AS-R003`, `D-S001-006` |
| `TB-S001-R005` | UI | The document and header preserve the visible title `Todo Angular Firebase` unless a later policy update renames the product. | `AS-R004`, `AS-R026` |
| `TB-S001-R006` | UI | The document has exactly one React root mount element. | `AS-R008`, `D-S001-001` |
| `TB-S001-R007` | UI | The favicon is preserved and served from Vite public assets. | `AS-R006`, `AS-R053` |
| `TB-S001-R008` | UI | Core shell rendering must not depend on third-party runtime font/icon scripts or stylesheets. | `AS-R005`, `AS-R007`, `D-S001-005` |
| `TB-S001-R009` | UI | `main.tsx` renders the React app with React 18 root bootstrap. | `AS-R010`, `AS-R014`, `D-S001-001` |
| `TB-S001-R010` | UI | Vite build mode replaces Angular production-mode toggling. | `AS-R009`, `AS-R055`, `D-S001-012` |
| `TB-S001-R011` | UI | Shell startup/render failures are handled through an ErrorBoundary and explicit development logging where appropriate. | `AS-R013`, `D-S001-007` |
| `TB-S001-R012` | Worker | The target MVP does not register or generate a service worker. | `AS-R011`, `AS-R012`, `AS-R049`, `AS-R050`, `AS-R051`, `AS-R054`, `D-S001-004` |
| `TB-S001-R013` | UI | `App.tsx` renders the header before the routed page outlet. | `AS-R019`, `AS-R022` |
| `TB-S001-R014` | UI | The routed content remains wrapped in a main shell area with class or style equivalent to `main`. | `AS-R022`, `AS-R030` |
| `TB-S001-R015` | UI | Feature page routes are supplied by feature slices; this slice owns the root route container and provider composition only. | `AS-R016`, `AS-R017`, `D-S001-002` |
| `TB-S001-R016` | UI | Shell-auth display state is consumed as a boolean from the target auth context/hook. | `AS-R020`, `AS-R023`, `D-S001-002` |
| `TB-S001-R017` | UI | Shell sign-out requests are delegated to the auth slice through an `onSignOut` callback. | `AS-R021`, `AS-R025` |
| `TB-S001-R018` | UI | `Header` is a pure React component with explicit props and no direct persistence or auth-service implementation. | `AS-R024`, `AS-R025`, `D-S001-002` |
| `TB-S001-R019` | UI | The sign-out control is rendered only for authenticated users. | `AS-R027` |
| `TB-S001-R020` | UI | Activating sign-out calls the callback without hash navigation side effects. | `AS-R028`, `D-S001-008` |
| `TB-S001-R021` | UI | The upstream GitHub repository link remains visible in the header. | `AS-R029` |
| `TB-S001-R022` | UI | Header height, padding, line height, right-aligned action layout, and separator intent are preserved in local SCSS. | `AS-R031`, `AS-R033` |
| `TB-S001-R023` | UI | Header icon affordances may be implemented with local CSS/assets or installed icon libraries, but not required external font CSS. | `AS-R032`, `D-S001-005` |
| `TB-S001-R024` | UI | Global SCSS is imported once and includes base, settings, and grid styles. | `AS-R034`, `D-S001-001` |
| `TB-S001-R025` | UI | `[hidden]` remains forced hidden globally. | `AS-R035` |
| `TB-S001-R026` | UI | Text selection background keeps the AS-IS visual token. | `AS-R036` |
| `TB-S001-R027` | UI | Background, font color, base font size, line height, and grid max width retain AS-IS values unless later UX policy changes them. | `AS-R037` |
| `TB-S001-R028` | UI | Font family uses local/system fallback and must not require Typekit availability. | `AS-R037`, `D-S001-005` |
| `TB-S001-R029` | UI | `.g-row` and `.g-col` helpers are preserved or mapped to equivalent utilities. | `AS-R038` |
| `TB-S001-R030` | UI | `minx` mixins/reset behavior is ported or replaced with local Vite-compatible SCSS/CSS. | `AS-R034`, `AS-R044`, `D-S001-009` |
| `TB-S001-R031` | UI | Vite config replaces Angular CLI app config for frontend root, assets, index, main entry, SCSS, and build output. | `AS-R039`, `D-S001-011` |
| `TB-S001-R032` | UI | Angular CLI lint/test config is not retained; Stage 6 supplies ESLint/Vitest/Playwright harness config. | `AS-R040`, `AS-R048`, `D-S001-010` |
| `TB-S001-R033` | UI | Frontend package scripts include local Vite dev/build/preview commands and omit `postbuild` precache. | `AS-R041`, `AS-R042`, `D-S001-004`, `D-S001-011` |
| `TB-S001-R034` | UI | React/Vite/React Router/React Query dependency families replace Angular/Firebase/RxJS/Zone shell dependencies. | `AS-R043`, `AS-R044`, `D-S001-001`, `D-S001-009` |
| `TB-S001-R035` | UI | TypeScript config uses modern strict TypeScript and no Angular decorator metadata requirement. | `AS-R045`, `D-S001-009` |
| `TB-S001-R036` | UI | Production frontend build excludes test files through Vite/Vitest conventions. | `AS-R046`, `D-S001-010` |
| `TB-S001-R037` | UI | Angular-specific polyfills are not included unless a concrete browser-support requirement is documented later. | `AS-R047`, `D-S001-009` |
| `TB-S001-R038` | UI | Target frontend lockfile reflects the selected modern package manager and target dependencies, not npm lockfile v1 Angular CLI pins. | `AS-R052`, `D-S001-011` |
| `TB-S001-R039` | UI | Shell does not define persistent domain entities or database schema. | AS-IS data model section |
| `TB-S001-R040` | UI | Shell implementation must be keyboard-accessible and satisfy WCAG 2.1 AA expectations for the header controls. | `AS-R027`, `AS-R028`, `D-S001-006`, `D-S001-008` |
| `TB-S001-R041` | UI | The frontend shell should support route-level code splitting/lazy loading for later feature routes where practical. | `D-S001-001`, `transform.md` section 9 performance |
| `TB-S001-R042` | UI | Required shell startup must work locally without Firebase project config, hosted auth providers, managed databases, Firebase Hosting, or service-worker generation. | `D-S001-003`, `D-S001-004`, `D-S001-011` |
| `TB-S001-R043` | UI | The environment/config dependency noted in AS-IS is resolved as target Vite config and does not require a strict `s001` dependency on the Firebase/config slice. | `AS-R055`, `D-S001-012` |

## Non-Functional Targets

| NFR | Target for this slice | Trace |
| --- | --- | --- |
| Local operability | `frontend` shell runs from local source with Vite and no Firebase/hosted/PWA setup. | `D-S001-003`, `D-S001-004`, `D-S001-011` |
| Accessibility | Do not disable user zoom; header controls must be keyboard accessible and expose semantic labels where icon-only visuals are used. | `D-S001-006`, `D-S001-008` |
| Performance | Use Vite build output and support lazy route loading for feature slices; no blocking third-party font/script requirement for first render. | `D-S001-001`, `D-S001-005` |
| Error handling | Render errors are surfaced through an ErrorBoundary and implementation must not swallow user-visible failures silently. | `D-S001-007` |
| Type safety | Strict TypeScript for React shell props and component contracts. | `D-S001-009` |
| Maintainability | Keep shell components small and presentational; auth/task/data behavior remains in owning slices. | `AS-R017`, `D-S001-002`, `D-S001-003` |
| Styling continuity | Preserve dark shell palette, grid width, base type scale, header layout, main padding, and favicon unless product policy changes them. | `AS-R030` through `AS-R038`, `AS-R053` |

## AS-IS Coverage Matrix

| AS-IS rule | TO-BE disposition |
| --- | --- |
| `AS-R001` | Preserved by `TB-S001-R001`. |
| `AS-R002` | Preserved by `TB-S001-R003`. |
| `AS-R003` | Reshaped by `TB-S001-R004` and `D-S001-006`. |
| `AS-R004` | Preserved by `TB-S001-R005`. |
| `AS-R005` | Reshaped by `TB-S001-R008` and `D-S001-005`. |
| `AS-R006` | Preserved by `TB-S001-R007`. |
| `AS-R007` | Replaced by `TB-S001-R008`, `TB-S001-R011`, `D-S001-005`, and `D-S001-007`. |
| `AS-R008` | Replaced by `TB-S001-R006` and `D-S001-001`. |
| `AS-R009` | Reshaped by `TB-S001-R010` and `D-S001-012`. |
| `AS-R010` | Replaced by `TB-S001-R009` and `D-S001-001`. |
| `AS-R011` | Dropped by `TB-S001-R012` and `D-S001-004`. |
| `AS-R012` | Dropped by `TB-S001-R012` and `D-S001-004`. |
| `AS-R013` | Reshaped by `TB-S001-R011` and `D-S001-007`. |
| `AS-R014` | Replaced by `TB-S001-R009` and `D-S001-001`. |
| `AS-R015` | Reshaped by `TB-S001-R001`, `TB-S001-R018`, and `D-S001-002`. |
| `AS-R016` | Preserved/reshaped by `TB-S001-R003`, `TB-S001-R015`, and `D-S001-002`. |
| `AS-R017` | Reshaped by `TB-S001-R015`, `TB-S001-R042`, `D-S001-002`, and `D-S001-003`. |
| `AS-R018` | Replaced by `TB-S001-R006` and `D-S001-001`. |
| `AS-R019` | Preserved by `TB-S001-R013`. |
| `AS-R020` | Reshaped by `TB-S001-R016` and `D-S001-002`. |
| `AS-R021` | Preserved as a callback contract by `TB-S001-R017`. |
| `AS-R022` | Preserved by `TB-S001-R013` and `TB-S001-R014`. |
| `AS-R023` | Reshaped by `TB-S001-R016` and `D-S001-002`. |
| `AS-R024` | Preserved as pure presentational behavior by `TB-S001-R018`. |
| `AS-R025` | Preserved/reshaped by `TB-S001-R017` and `TB-S001-R018`. |
| `AS-R026` | Preserved by `TB-S001-R005`. |
| `AS-R027` | Preserved by `TB-S001-R019`. |
| `AS-R028` | Reshaped by `TB-S001-R020` and `D-S001-008`. |
| `AS-R029` | Preserved by `TB-S001-R021`. |
| `AS-R030` | Preserved by `TB-S001-R014`. |
| `AS-R031` | Preserved by `TB-S001-R022`. |
| `AS-R032` | Reshaped by `TB-S001-R023` and `D-S001-005`. |
| `AS-R033` | Preserved by `TB-S001-R022`. |
| `AS-R034` | Preserved/reshaped by `TB-S001-R024`, `TB-S001-R030`, and `D-S001-009`. |
| `AS-R035` | Preserved by `TB-S001-R025`. |
| `AS-R036` | Preserved by `TB-S001-R026`. |
| `AS-R037` | Preserved/reshaped by `TB-S001-R027`, `TB-S001-R028`, and `D-S001-005`. |
| `AS-R038` | Preserved by `TB-S001-R029`. |
| `AS-R039` | Replaced by `TB-S001-R002`, `TB-S001-R031`, and `D-S001-011`. |
| `AS-R040` | Moved to Stage 6 by `TB-S001-R032` and `D-S001-010`. |
| `AS-R041` | Replaced by `TB-S001-R033` and `D-S001-011`. |
| `AS-R042` | Dropped/replaced by `TB-S001-R012`, `TB-S001-R033`, `D-S001-004`, and `D-S001-011`. |
| `AS-R043` | Replaced by `TB-S001-R034` and `D-S001-009`. |
| `AS-R044` | Replaced by `TB-S001-R030`, `TB-S001-R034`, and `D-S001-009`. |
| `AS-R045` | Replaced by `TB-S001-R035` and `D-S001-009`. |
| `AS-R046` | Preserved by `TB-S001-R036`. |
| `AS-R047` | Dropped/reshaped by `TB-S001-R037` and `D-S001-009`. |
| `AS-R048` | Moved to Stage 6 by `TB-S001-R032` and `D-S001-010`. |
| `AS-R049` | Dropped by `TB-S001-R012` and `D-S001-004`. |
| `AS-R050` | Dropped by `TB-S001-R012` and `D-S001-004`. |
| `AS-R051` | Dropped by `TB-S001-R012` and `D-S001-004`. |
| `AS-R052` | Replaced by `TB-S001-R038` and `D-S001-011`. |
| `AS-R053` | Preserved by `TB-S001-R007`. |
| `AS-R054` | Recorded and dropped from MVP by `TB-S001-R012` and `D-S001-004`. |
| `AS-R055` | Resolved by `TB-S001-R010`, `TB-S001-R043`, and `D-S001-012`. |

## Open Questions and Stage 4 Notes

| ID | Status | Resolution for Stage 4 |
| --- | --- | --- |
| `AS-OQ001` | Resolved for this slice | Treat production environment handling as Vite mode/config. No strict dependency on the Firebase/config slice is needed for shell implementation. |
| `AS-OQ002` | Resolved for this slice | Preserve sign-out intent, not the incidental `href="#"` navigation side effect. Implement an accessible button/callback. |
| `AS-OQ003` | Resolved for this slice | Preserve visual intent, but do not make external Typekit/font/icon loading required for shell operation. |

Stage 4 can create implementation tasks from this spec without reading the legacy source. The tasks should keep this slice limited to frontend shell/build/styles scaffolding and typed integration points for later auth/task slices.
