# AS-IS Specification: s001-platform-shell-and-styles

## Confidence Summary

Stage 2 confidence is high for the browser shell, Angular bootstrap, root module composition, header behavior, global styling, build scripts, TypeScript config, polyfills, and service-worker hook because the rules below are directly traced to source files and line numbers.

No runtime tests were executed for this documentation-only recovery. The spec is based on static source review plus Stage 1 analyzer artifacts. Package-lock content was spot-checked for the lockfile format and Angular CLI version, but the full lockfile dependency graph was not revalidated.

## Scope and Module List

Slice `s001-platform-shell-and-styles` is defined by `slices.json` as the platform shell and styles slice with no declared slice dependencies. It owns the browser entry point, root Angular shell, header shell, global SCSS, static favicon, Angular CLI app configuration, npm scripts/lockfile, TypeScript app configuration, and `sw-precache` configuration.

Source modules:

- `src/index.html`
- `src/main.ts`
- `src/polyfills.ts`
- `src/test.ts`
- `src/app/app.module.ts`
- `src/app/app.component.ts`
- `src/app/app.component.scss`
- `src/app/app-header.component.ts`
- `src/app/app-header.component.scss`
- `src/styles/_base.scss`
- `src/styles/_grid.scss`
- `src/styles/_settings.scss`
- `src/styles/styles.scss`
- `src/assets/favicon.ico`
- `.angular-cli.json`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `src/tsconfig.app.json`
- `sw-precache.config.js`

Stage 1 analyzer context identifies this slice as the application shell, styling/assets, and build/PWA baseline. It also notes that Firebase Hosting, CI/CD, and PWA/service-worker behavior are AS-IS operational behavior even when later target stages may exclude them.

## AS-IS Interfaces

### Browser Document Interface

- `src/index.html` is the top-level browser document loaded by the app.
- It declares the document language, base href, browser metadata, page title, external style/script resources, favicon, and the Angular mount element.
- The only DOM mount point in this document is `<app-root>`.

### Angular Runtime Interface

- `src/main.ts` is the Angular browser runtime entry point.
- It conditionally enables Angular production mode based on the imported environment flag.
- It bootstraps `AppModule` through `platformBrowserDynamic()`.
- After a successful bootstrap, it conditionally registers `/service-worker.js` for production browsers that expose `navigator.serviceWorker`.
- Bootstrap errors are logged to the browser console.

### Angular Root Module Interface

- `AppModule` bootstraps `AppComponent`.
- `AppModule` declares `AppComponent` and `AppHeaderComponent`.
- `AppModule` imports `BrowserModule`, root `RouterModule.forRoot([], {useHash: false})`, `AuthModule`, `FirebaseModule`, and `TasksModule`.
- The root router is configured with no shell-owned routes; feature modules provide their own routes.

### Root Shell Component Interface

- `AppComponent` is selected by `app-root`.
- Its template renders `app-header` and a `<router-outlet>`.
- It binds header `authenticated` input to `auth.authenticated$ | async`.
- It handles the header `signOut` output by calling `auth.signOut()`.
- `AuthService` is injected as a public constructor parameter, making it available to the inline template.

### Header UI Interface

- `AppHeaderComponent` is selected by `app-header`.
- The component uses `ChangeDetectionStrategy.OnPush`.
- It accepts one input: `authenticated: boolean`.
- It exposes one output: `signOut`, an `EventEmitter`.
- The rendered header displays the title `Todo Angular Firebase`.
- The `Sign out` link is rendered only when `authenticated` is truthy.
- Clicking `Sign out` emits the `signOut` event.
- The header always renders a GitHub link to `https://github.com/r-park/todo-angular-firebase`.

### Style and Asset Interface

- Global styles are loaded from `src/styles/styles.scss` via `.angular-cli.json`.
- Global SCSS imports base styles, `minx` reset/elements, and grid styles.
- Base settings define the app background color, font color, font family, font size, line height, and grid max width.
- Grid helpers expose `.g-row` and `.g-col`.
- Shell component styles add bottom padding to `<main class="main">`.
- Header component styles rely on `minx` functions/mixins and Font Awesome icon mixins.
- `src/assets/favicon.ico` is the favicon referenced by the browser document.

### Build, Package, and Test Harness Interface

- `.angular-cli.json` names the project `todo-angular-firebase`, uses `src` as the app root, emits build output to `dist`, copies `assets`, uses `index.html`, `main.ts`, `polyfills.ts`, `test.ts`, `tsconfig.app.json`, and `tsconfig.spec.json`, sets prefix `app`, and globally loads `styles/styles.scss`.
- The Angular CLI default component style extension is SCSS.
- `package.json` declares Node `>=8.1` and npm `>= 5`.
- npm scripts expose `build`, `e2e`, `lint`, `ng`, `postbuild`, `precache`, `start`, and `test`.
- Production build uses `ng build --prod`; `postbuild` runs `npm run precache`; `precache` invokes `sw-precache --config=sw-precache.config.js --verbose`.
- The root TypeScript config compiles against `es2016` and `dom`, targets ES5, enables decorators/metadata, uses source maps, and resolves modules through Node.
- The app TypeScript config extends the root config, uses `es2015` modules, emits to `../out-tsc/app`, has no global `types`, and excludes `test.ts` plus `*.spec.ts`.
- `src/polyfills.ts` imports `core-js` reflect polyfills and `zone.js/dist/zone`.
- `src/test.ts` configures Angular's dynamic browser testing module, loads every `*.spec.ts` file through Karma's webpack require context, then starts Karma.
- `package-lock.json` is npm lockfile version 1 and locks the Angular CLI dependency to version 1.2.0.

### Service Worker / PWA Interface

- `sw-precache.config.js` configures generated service-worker behavior for built `dist` assets.
- Navigation fallback is `/index.html`, with a whitelist that excludes paths beginning with `/__`.
- Runtime cache rules use `cacheFirst` for Google Fonts CSS, Bootstrap CDN Font Awesome CSS, and Typekit.
- Static file globs include built assets, CSS, HTML, and JS under `dist`.
- `stripPrefix` removes `dist/` from generated precache paths.

## Business and Behavior Rules

| Rule ID | Tag | Rule |
| --- | --- | --- |
| AS-R001 | [analyzer] | The slice is the platform shell/styles baseline and has no declared slice dependencies in the migration plan. |
| AS-R002 | [source-traced] | The browser document must use base href `/`, enabling browser-history routing relative to the app root. |
| AS-R003 | [source-traced] | The document viewport is fixed to device width, initial scale 1, and `user-scalable=no`. |
| AS-R004 | [source-traced] | The document title is `Todo Angular Firebase`. |
| AS-R005 | [source-traced] | The document loads Google Material Icons, Font Awesome 4.4.0, and Typekit from third-party URLs at runtime. |
| AS-R006 | [source-traced] | The favicon is loaded from `assets/favicon.ico`. |
| AS-R007 | [source-traced] | Typekit loading errors are swallowed by an empty `catch` block. |
| AS-R008 | [source-traced] | Angular is mounted through a single `<app-root>` element in the document body. |
| AS-R009 | [source-traced] | Angular production mode is enabled only when `environment.production` is truthy. |
| AS-R010 | [source-traced] | The app bootstraps `AppModule` through `platformBrowserDynamic().bootstrapModule(AppModule)`. |
| AS-R011 | [source-traced] | Service-worker registration is attempted only after successful Angular bootstrap, only when production mode is true, and only when the browser exposes `navigator.serviceWorker`. |
| AS-R012 | [source-traced] | Service-worker registration targets `/service-worker.js` and logs successful registration scope to the console. |
| AS-R013 | [source-traced] | Angular bootstrap failures are logged with `console.error`. |
| AS-R014 | [source-traced] | `AppModule` bootstraps `AppComponent`. |
| AS-R015 | [source-traced] | `AppModule` declares only `AppComponent` and `AppHeaderComponent` in this slice. |
| AS-R016 | [source-traced] | The root router is initialized with an empty local route array and `useHash: false`; route definitions come from imported feature modules. |
| AS-R017 | [source-traced] | The shell composes `AuthModule`, `FirebaseModule`, and `TasksModule` through the root module imports. |
| AS-R018 | [source-traced] | The root component's selector is `app-root`, matching the document mount element. |
| AS-R019 | [source-traced] | The root component renders the header before the routed page outlet. |
| AS-R020 | [source-traced] | Header authentication display state is driven by `AuthService.authenticated$` through Angular's async pipe. |
| AS-R021 | [source-traced] | Header sign-out requests are delegated directly to `AuthService.signOut()`. |
| AS-R022 | [source-traced] | The routed feature page is rendered inside `<main class="main"><router-outlet></router-outlet></main>`. |
| AS-R023 | [source-traced] | `AppComponent` exposes `AuthService` as a public constructor parameter for template binding. |
| AS-R024 | [source-traced] | `AppHeaderComponent` uses OnPush change detection. |
| AS-R025 | [source-traced] | `AppHeaderComponent` accepts a boolean `authenticated` input and emits sign-out through an `EventEmitter`. |
| AS-R026 | [source-traced] | The header title text is `Todo Angular Firebase`. |
| AS-R027 | [source-traced] | The `Sign out` link is present only when `authenticated` is truthy. |
| AS-R028 | [source-traced] | Clicking the `Sign out` link emits the header `signOut` event; the link also has `href="#"`. |
| AS-R029 | [source-traced] | The header always includes a link to the upstream GitHub repository. |
| AS-R030 | [source-traced] | The shell main area adds 90px bottom padding. |
| AS-R031 | [source-traced] | Header layout is 60px high with 10px vertical padding, hidden overflow, and 40px line height. |
| AS-R032 | [source-traced] | Header title and GitHub link icons are implemented through Font Awesome mixins and FontAwesome font-family styling. |
| AS-R033 | [source-traced] | Header links are floated right; the last link receives a left margin, left padding, and left border unless it is also the first item. |
| AS-R034 | [source-traced] | Global SCSS imports base styles, `minx` reset/elements, and grid styles. |
| AS-R035 | [source-traced] | `[hidden]` is forced to `display: none !important`. |
| AS-R036 | [source-traced] | Text selection background is `rgba(200,200,255,.1)`. |
| AS-R037 | [source-traced] | Base visual settings default to background `#222`, font color `#999`, `aktiv-grotesk-std`/Helvetica/Arial/sans-serif, 18px base font size, 24px line height, and 810px grid max width. |
| AS-R038 | [source-traced] | Grid helpers expose `.g-row` through `grid-row` and `.g-col` through `grid-column` with width 100%. |
| AS-R039 | [source-traced] | Angular CLI app configuration uses `src` as root, `dist` as output, includes `assets`, and wires `index.html`, `main.ts`, `polyfills.ts`, `test.ts`, app/test tsconfigs, app prefix, and global SCSS. |
| AS-R040 | [source-traced] | Angular CLI lint configuration targets app, spec, and e2e TypeScript configs; Karma config is `./karma.conf.js`. |
| AS-R041 | [source-traced] | npm scripts define production build, e2e, lint, CLI passthrough, postbuild precache, start, and test commands. |
| AS-R042 | [source-traced] | Production build is followed by `npm run precache` through the `postbuild` script. |
| AS-R043 | [source-traced] | Runtime dependencies include Angular 4.2.6 packages, Angular Router 4.2.6, AngularFire2 4.0.0-rc.1, Firebase 4.1.3, RxJS 5.4.2, and Zone.js 0.8.12. |
| AS-R044 | [source-traced] | Development dependencies include Angular CLI 1.2.0, TypeScript 2.4.1, `minx` from `r-park/minx.git`, and `sw-precache` 5.2.0. |
| AS-R045 | [source-traced] | Root TypeScript compilation targets ES5, uses `es2016` and `dom` libs, enables decorators and decorator metadata, emits source maps, and resolves modules through Node. |
| AS-R046 | [source-traced] | The app TypeScript config excludes `test.ts` and all `*.spec.ts` files from the app build. |
| AS-R047 | [source-traced] | Runtime polyfills import `core-js` reflect polyfills and Zone.js; older IE/Web Animations/Intl polyfills are present only as commented guidance. |
| AS-R048 | [source-traced] | Unit-test bootstrap imports Zone.js test patches, initializes `BrowserDynamicTestingModule`, loads all `*.spec.ts` files under `src`, and starts Karma manually. |
| AS-R049 | [source-traced] | `sw-precache` generated service-worker config uses `/index.html` as navigation fallback and excludes `/__*` paths from fallback matching. |
| AS-R050 | [source-traced] | `sw-precache` runtime caching uses `cacheFirst` for Google Fonts, Bootstrap CDN, and Typekit resources. |
| AS-R051 | [source-traced] | `sw-precache` precaches built assets, CSS, HTML, and JS files under `dist` and strips the `dist/` prefix from generated paths. |
| AS-R052 | [source-traced] | The package lock is npm lockfile version 1 and pins `@angular/cli` to 1.2.0. |
| AS-R053 | [source-traced] | The favicon asset is part of the slice module list and is the same asset referenced by the browser document favicon link. |
| AS-R054 | [analyzer] | Stage 1 classifies PWA/service-worker behavior as AS-IS operational behavior that must be recorded, even if target stages exclude it. |
| AS-R055 | [open-question] | The shell imports `environment.production` from an environment module owned by another slice. A migration planner should confirm whether this affects slice ordering; this only blocks Stage 4 task sequencing if strict dependency topology is required. |

## Data Model

This slice does not define persistent application domain entities or database tables. Its data-bearing contracts are UI/configuration contracts:

- Browser document metadata: title, viewport, base href, external asset URLs, favicon URL, and Angular mount element.
- `AppHeaderComponent.authenticated`: boolean input controlling the sign-out link.
- `AppHeaderComponent.signOut`: event output emitted by the sign-out link.
- `AuthService.authenticated$`: observable consumed by the shell template but owned by the authentication slice.
- Angular CLI app configuration: app root, output directory, asset folder, entry files, tsconfig paths, prefix, global stylesheet path, lint/test config references.
- TypeScript compiler configuration: compiler target, libs, decorator settings, module resolution, source maps, output paths, and app build exclusions.
- Service-worker generation configuration: navigation fallback, runtime caching URL patterns and handlers, static file globs, and strip prefix.
- npm package metadata and scripts.
- Static favicon binary.

No source in this slice directly reads or writes Firebase data. The shell composes `FirebaseModule` through `AppModule`, but Firebase initialization and database behavior are owned by another slice.

## Side Effects

- The browser loads third-party styles/scripts from Google Fonts, MaxCDN Font Awesome, and Typekit when rendering `src/index.html`.
- Typekit loading is attempted asynchronously and failures are ignored.
- Angular bootstrapping creates the root app component tree under `<app-root>`.
- In production-capable browsers with service-worker support, the app attempts to register `/service-worker.js` after Angular bootstrap.
- Successful service-worker registration logs scope information to the console.
- Angular bootstrap failure logs an error to the console.
- Clicking header `Sign out` emits a component event that `AppComponent` maps to `AuthService.signOut()`.
- `npm run build` produces production assets through Angular CLI, then `postbuild` triggers `sw-precache` generation.
- `npm start`, `npm test`, `npm run lint`, and `npm run e2e` delegate to Angular CLI commands.
- `src/test.ts` prevents Karma auto-start, initializes Angular test infrastructure, loads spec files, then starts Karma.

## Edge Cases and Error Behavior

- `Typekit.load` exceptions are swallowed, so Typekit failure does not surface in UI or logs.
- Service-worker registration is skipped outside production mode.
- Service-worker registration is skipped when `navigator.serviceWorker` is not present.
- Service-worker registration has a success handler but no local failure handler in the source.
- Angular bootstrap has a failure handler that logs to `console.error` but does not render a fallback state.
- The sign-out anchor uses `href="#"`; the header emits `signOut`, but the source does not explicitly prevent the anchor's default navigation behavior.
- The root router starts with no shell-owned routes; if feature modules fail to provide routes, the shell still renders a router outlet but owns no page-level fallback route.
- Global `[hidden]` styling uses `!important`, which can override component-level display decisions.
- The viewport disables user scaling in supported mobile browsers.
- The app build excludes `test.ts` and `*.spec.ts`, so test-only files are not part of the production app bundle.
- Old IE, Web Animations, and Intl polyfills are documented but commented out; they are not active runtime behavior.

## Open Questions

| ID | Question | Owner | Blocks |
| --- | --- | --- | --- |
| AS-OQ001 | `src/main.ts` imports `environment.production`, while environment files are assigned to `s002-firebase-platform-and-security-rules`. Should the migration slice plan record a formal dependency from `s001` to the environment/config slice, or is this acceptable shared platform context? | Migration orchestrator/planner | Stage 4 task sequencing only if strict slice topology is required. Stage 3 can proceed with this AS-IS behavior. |
| AS-OQ002 | Should the `href="#"` behavior on the sign-out link be preserved as-is, or should downstream stages treat it as an incidental legacy artifact while preserving only the emitted sign-out event? | Product/UX owner or migration orchestrator | Stage 3 shell/header transform decision. |
| AS-OQ003 | Should third-party runtime font/icon loading failures remain silent, matching Typekit's empty catch and stylesheet behavior, or should downstream stages define visible/logged asset-loading failure behavior? | Product/UX owner or migration orchestrator | Stage 3 style/platform transform decision. |

## Traceability Table

| Rule ID | Evidence |
| --- | --- |
| AS-R001 | `slices.json:3-30`; `specs/analyze/architecture.md:347-349` |
| AS-R002 | `src/index.html:4`; `src/app/app.module.ts:25` |
| AS-R003 | `src/index.html:8` |
| AS-R004 | `src/index.html:10` |
| AS-R005 | `src/index.html:12-17`; `specs/analyze/assessment.md:90` |
| AS-R006 | `src/index.html:14`; `src/assets/favicon.ico` |
| AS-R007 | `src/index.html:17` |
| AS-R008 | `src/index.html:21-23`; `src/app/app.component.ts:5-7` |
| AS-R009 | `src/main.ts:8-10` |
| AS-R010 | `src/main.ts:13`; `src/app/app.module.ts:15-18` |
| AS-R011 | `src/main.ts:13-18` |
| AS-R012 | `src/main.ts:16-18` |
| AS-R013 | `src/main.ts:21` |
| AS-R014 | `src/app/app.module.ts:15-18` |
| AS-R015 | `src/app/app.module.ts:19-22` |
| AS-R016 | `src/app/app.module.ts:23-30`; `specs/analyze/architecture.md:16` |
| AS-R017 | `src/app/app.module.ts:9-12`; `src/app/app.module.ts:27-29` |
| AS-R018 | `src/app/app.component.ts:5-7`; `src/index.html:22` |
| AS-R019 | `src/app/app.component.ts:8-15` |
| AS-R020 | `src/app/app.component.ts:9-11` |
| AS-R021 | `src/app/app.component.ts:9-11` |
| AS-R022 | `src/app/app.component.ts:13-15`; `src/app/app.component.scss:1-3` |
| AS-R023 | `src/app/app.component.ts:18-20`; `specs/analyze/assessment.md:30` |
| AS-R024 | `src/app/app-header.component.ts:1-7` |
| AS-R025 | `src/app/app-header.component.ts:24-27` |
| AS-R026 | `src/app/app-header.component.ts:9-13` |
| AS-R027 | `src/app/app-header.component.ts:14-16` |
| AS-R028 | `src/app/app-header.component.ts:14-16` |
| AS-R029 | `src/app/app-header.component.ts:14-17` |
| AS-R030 | `src/app/app.component.scss:1-3` |
| AS-R031 | `src/app/app-header.component.scss:7-12` |
| AS-R032 | `src/app/app-header.component.scss:15-28`; `src/app/app-header.component.scss:65-72` |
| AS-R033 | `src/app/app-header.component.scss:32-51` |
| AS-R034 | `src/styles/styles.scss:1-5`; `src/styles/_base.scss:1-5`; `specs/analyze/architecture.md:157-178` |
| AS-R035 | `src/styles/styles.scss:8-10` |
| AS-R036 | `src/styles/styles.scss:12-14` |
| AS-R037 | `src/styles/_settings.scss:5-15` |
| AS-R038 | `src/styles/_grid.scss:5-12` |
| AS-R039 | `.angular-cli.json:3-29` |
| AS-R040 | `.angular-cli.json:36-50` |
| AS-R041 | `package.json:21-30` |
| AS-R042 | `package.json:21-29`; `sw-precache.config.js:1-31` |
| AS-R043 | `package.json:31-46`; `specs/analyze/assessment.md:72-82` |
| AS-R044 | `package.json:47-70`; `specs/analyze/assessment.md:72-82` |
| AS-R045 | `tsconfig.json:1-20` |
| AS-R046 | `src/tsconfig.app.json:1-13` |
| AS-R047 | `src/polyfills.ts:21-72` |
| AS-R048 | `src/test.ts:1-32` |
| AS-R049 | `sw-precache.config.js:1-9` |
| AS-R050 | `sw-precache.config.js:10-23` |
| AS-R051 | `sw-precache.config.js:24-31` |
| AS-R052 | `package-lock.json:1-15` |
| AS-R053 | `slices.json:20`; `src/index.html:14` |
| AS-R054 | `specs/analyze/architecture.md:24`; `specs/analyze/assessment.md:20`; `specs/analyze/assessment.md:109-117` |
| AS-R055 | `src/main.ts:4-9`; `slices.json:28`; `slices.json:33-44` |
