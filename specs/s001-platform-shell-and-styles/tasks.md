# Stage 4 Tasks: s001-platform-shell-and-styles

## Prerequisites

- Stage 5 must start from the Stage 3 review branch input used for this task plan: `agent/MIG-3/stage-3-platform-shell` at commit `ed654ba6acca1e82c0555cf7a14f8efac376fb5e`.
- Required source specs are present:
  - `specs/s001-platform-shell-and-styles/t-spec.md`
  - `specs/s001-platform-shell-and-styles/a-spec.md`
  - `architecture.md`
  - `transform.md`
  - `constitution.md`
- No Firebase project, hosted OAuth provider, managed database, Firebase Hosting, or service-worker setup is required for this slice.
- Node and npm must be available locally for Vite frontend install/build work. The exact supported Node version should be declared by the implementation task that creates `frontend/package.json`.
- Later slices own auth truth, backend APIs, task pages, and the full Vitest/RTL/Playwright harness. This slice may create typed UI integration points and local placeholders only where needed for a compiling shell.
- `frontend/public/favicon.ico` should preserve the existing binary asset from `src/assets/favicon.ico`.

## Ordered Bundles

1. Frontend scaffold and browser entry: `T001`, `T002`
2. Shell composition and header contract: `T003`, `T004`
3. Styling and visual continuity: `T005`, `T006`
4. Policy exclusion and slice verification: `T007`

## Tasks

### T001 - Create the Vite frontend scaffold and build surface

- status: `done`
- goal: Create the target `frontend/` Vite React TypeScript project shell with local build scripts and modern strict TypeScript configuration.
- t-spec references:
  - Target Scope: frontend package metadata, Vite config, TypeScript configs, local shell/build scripts
  - Target Component and File Mapping: `.angular-cli.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `src/tsconfig.app.json`
  - Build and Package mapping
  - TO-BE rules: `TB-S001-R002`, `TB-S001-R031`, `TB-S001-R032`, `TB-S001-R033`, `TB-S001-R034`, `TB-S001-R035`, `TB-S001-R036`, `TB-S001-R038`, `TB-S001-R042`, `TB-S001-R043`
  - Deltas: `D-S001-001`, `D-S001-004`, `D-S001-009`, `D-S001-010`, `D-S001-011`, `D-S001-012`
- files to create or edit:
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `frontend/vite.config.ts`
  - `frontend/tsconfig.json`
  - `frontend/tsconfig.app.json`
  - `frontend/tsconfig.node.json`
  - Optional root helper script files only if needed for local startup; do not rewrite legacy root package metadata unless the implementation explicitly chooses a root helper.
- implementation steps:
  - Create a `frontend/` project rooted at Vite React TypeScript conventions.
  - Add React 18, React DOM, React Router 6, and build-time Vite/TypeScript dependencies. Do not add Angular, AngularFire, Firebase, RxJS, Zone.js, `minx`, or `sw-precache` to target runtime dependencies.
  - Add scripts for local `dev`, `build`, and `preview`. Do not add a `postbuild` precache script.
  - Configure Vite with React plugin support, SCSS handling, `frontend/index.html`, `frontend/public` assets, and local build output.
  - Configure strict TypeScript without Angular decorator metadata or Angular polyfill assumptions.
  - Keep test/lint harness configuration minimal or deferred to `s006-test-and-quality-harness`; do not migrate Angular CLI/Karma/Protractor/TSLint config here.
- acceptance check:
  - `cd frontend && npm install` creates or updates `frontend/package-lock.json`.
  - `cd frontend && npm run build` reaches the next missing source-file failure at most before downstream tasks, and after all dependencies are done it succeeds.
  - Inspect `frontend/package.json` and confirm there is no Angular/Firebase/RxJS/Zone/minx/sw-precache dependency and no `postbuild` precache script.
  - Inspect TypeScript config and confirm `strict` is enabled and `experimentalDecorators`/`emitDecoratorMetadata` are not required for the shell.
- depends_on: []
- notes and open questions:
  - Do not remove or rewrite the legacy Angular root files as part of this task unless a later migration decision explicitly moves them under `legacy/`.

### T002 - Port the browser document, favicon, and React runtime entry

- status: `done`
- goal: Replace the Angular browser document and bootstrap with a Vite document, preserved favicon/title, and React 18 root render entry.
- t-spec references:
  - Browser Document interface mapping
  - Runtime Bootstrap interface mapping
  - Data Model Mapping: document metadata
  - TO-BE rules: `TB-S001-R003`, `TB-S001-R004`, `TB-S001-R005`, `TB-S001-R006`, `TB-S001-R007`, `TB-S001-R008`, `TB-S001-R009`, `TB-S001-R010`, `TB-S001-R012`, `TB-S001-R024`, `TB-S001-R037`, `TB-S001-R042`, `TB-S001-R043`
  - Deltas: `D-S001-001`, `D-S001-004`, `D-S001-005`, `D-S001-006`, `D-S001-009`, `D-S001-012`
- files to create or edit:
  - `frontend/index.html`
  - `frontend/src/main.tsx`
  - `frontend/public/favicon.ico`
  - `frontend/src/styles/styles.scss` import wiring as needed
- implementation steps:
  - Create `frontend/index.html` with base href `/`, one React root element, title `Todo Angular Firebase`, and favicon link served from Vite public assets.
  - Preserve responsive viewport behavior but remove the AS-IS `user-scalable=no` restriction.
  - Remove third-party runtime Material Icons, Font Awesome CDN, and Typekit links/scripts from the target document.
  - Copy `src/assets/favicon.ico` to `frontend/public/favicon.ico`.
  - Create `frontend/src/main.tsx` using React 18 `createRoot` to render the app.
  - Import global SCSS exactly once from the React entry point or root app.
  - Do not register a service worker and do not import Angular polyfills.
- acceptance check:
  - Inspect `frontend/index.html` and confirm it has exactly one `id="root"` mount, preserves the title, links to `/favicon.ico`, has no external font/icon/script URLs, and does not disable user zoom.
  - Inspect `frontend/src/main.tsx` and confirm it uses React 18 `createRoot`, imports the global stylesheet once, and contains no Angular bootstrap/polyfill/service-worker code.
  - Confirm `cmp -s src/assets/favicon.ico frontend/public/favicon.ico` exits successfully.
- depends_on: [`T001`]
- notes and open questions:
  - If a Vite base path is configured later, keep browser routing root-relative unless product policy changes.

### T003 - Implement the root shell, router outlet, error boundary, and cross-slice placeholders

- status: `pending`
- goal: Create the React app root that renders the header before routed content, supports non-hash browser routing, and exposes typed integration points for later auth/task slices.
- t-spec references:
  - Root Shell interface mapping
  - Runtime Bootstrap interface mapping
  - Rule Placement by Tier: UI/frontend shell and cross-slice contract
  - Non-Functional Targets: local operability, error handling, maintainability, performance
  - TO-BE rules: `TB-S001-R001`, `TB-S001-R003`, `TB-S001-R011`, `TB-S001-R013`, `TB-S001-R014`, `TB-S001-R015`, `TB-S001-R016`, `TB-S001-R017`, `TB-S001-R039`, `TB-S001-R041`, `TB-S001-R042`, `TB-S001-R043`
  - Deltas: `D-S001-001`, `D-S001-002`, `D-S001-003`, `D-S001-007`, `D-S001-012`
- files to create or edit:
  - `frontend/src/App.tsx`
  - `frontend/src/components/ErrorBoundary.tsx`
  - `frontend/src/routes/router.tsx`
  - Optional `frontend/src/types/` shell contract file if needed to keep auth/task integration typed without implementing those slices.
- implementation steps:
  - Create `App.tsx` as the root shell component.
  - Render `<Header />` before a `<main className="main">` routed outlet or equivalent route container.
  - Use React Router 6 BrowserRouter or a router setup that preserves browser-history routing and does not use hash routing.
  - Add `ErrorBoundary` around the shell/routed content so render failures surface explicitly.
  - Keep feature page implementations out of this slice. Provide only empty route containers, route outlet composition, lazy-route extension points, or temporary placeholder elements needed for a working shell.
  - Define the shell-auth contract as a boolean authenticated value plus sign-out callback. Until `s003` supplies auth state, use an explicit local placeholder such as `authenticated: false` and a no-op callback, with the replacement point clear in code.
  - Do not import Firebase runtime modules, backend API clients, task models, or persistent data schemas.
- acceptance check:
  - Inspect `frontend/src/App.tsx` and confirm header renders before `main.main`, routed content is in the main area, and feature/auth/task behavior is not implemented here.
  - Inspect routing setup and confirm it uses browser routing, not hash routing.
  - Inspect `ErrorBoundary` and confirm it renders a visible fallback for render failures and does not silently swallow user-visible failures.
  - `cd frontend && npm run build` succeeds after `T004`, `T005`, and `T006` are complete.
- depends_on: [`T002`]
- notes and open questions:
  - The auth placeholder is temporary implementation scaffolding only. `s003-authentication-and-route-access` owns real auth state, sign-out behavior, route guards, and redirects.

### T004 - Implement the accessible Header component contract

- status: `pending`
- goal: Create the React `Header` component with explicit props, preserved title/GitHub link, authenticated-only sign-out control, and no hash navigation side effect.
- t-spec references:
  - Header UI interface mapping
  - Data Model Mapping: `authenticated` boolean and `onSignOut` callback
  - Non-Functional Targets: accessibility and maintainability
  - TO-BE rules: `TB-S001-R005`, `TB-S001-R016`, `TB-S001-R017`, `TB-S001-R018`, `TB-S001-R019`, `TB-S001-R020`, `TB-S001-R021`, `TB-S001-R023`, `TB-S001-R040`
  - Deltas: `D-S001-002`, `D-S001-005`, `D-S001-008`
- files to create or edit:
  - `frontend/src/components/Header.tsx`
  - `frontend/src/App.tsx` only for wiring the new component props if not already wired by `T003`
- implementation steps:
  - Create a pure React function component with explicit props: `authenticated: boolean` and `onSignOut: () => void`.
  - Render visible title text `Todo Angular Firebase`.
  - Render the upstream GitHub repository link `https://github.com/r-park/todo-angular-firebase` for all users.
  - Render the sign-out control only when `authenticated` is true.
  - Implement sign-out as a semantic `button` or an accessible link handler that prevents navigation; prefer `button` unless visual requirements require a link.
  - Provide accessible labels for icon-only visuals and ensure keyboard activation works through native controls.
  - Do not implement auth persistence, token clearing, route redirects, or API calls in the header.
- acceptance check:
  - Inspect `Header.tsx` and confirm the props are explicit and no auth service, Firebase module, storage API, or API client is imported.
  - Inspect rendered markup and confirm sign-out is conditional on `authenticated`, calls `onSignOut`, and cannot navigate to `#`.
  - Inspect the GitHub link and confirm it remains visible and points to the upstream repository.
  - Keyboard inspection confirms tab focus reaches the sign-out control when present and the GitHub link in all states.
- depends_on: [`T003`]
- notes and open questions:
  - Preserve sign-out intent, not the legacy `href="#"` side effect resolved by `AS-OQ002`.

### T005 - Port global settings, base styles, grid helpers, and local minx replacements

- status: `pending`
- goal: Move the reusable global SCSS into the Vite frontend while preserving the AS-IS visual tokens and removing `minx` as a required dependency.
- t-spec references:
  - Styles and Assets interface mapping
  - Data Model Mapping: SCSS tokens, `.g-row`, `.g-col`
  - Non-Functional Targets: styling continuity and performance
  - TO-BE rules: `TB-S001-R024`, `TB-S001-R025`, `TB-S001-R026`, `TB-S001-R027`, `TB-S001-R028`, `TB-S001-R029`, `TB-S001-R030`, `TB-S001-R042`
  - Deltas: `D-S001-005`, `D-S001-009`
- files to create or edit:
  - `frontend/src/styles/_settings.scss`
  - `frontend/src/styles/_base.scss`
  - `frontend/src/styles/_grid.scss`
  - `frontend/src/styles/styles.scss`
- implementation steps:
  - Port settings for background `#222`, font color `#999`, base font size `18px`, line height `24px`, and grid max width `810px`.
  - Use a local/system font stack that does not require Typekit availability.
  - Replace `minx` reset/elements/mixins with local SCSS/CSS equivalents that satisfy the shell layout needs.
  - Preserve `[hidden] { display: none !important; }`.
  - Preserve text selection background `rgba(200,200,255,.1)`.
  - Preserve or equivalently implement `.g-row` and `.g-col` helpers, including full-width `.g-col` behavior and centered/max-width row behavior.
  - Ensure global SCSS is imported once through `T002` entry wiring.
- acceptance check:
  - Inspect `frontend/src/styles/*.scss` and confirm all listed visual tokens and helper classes are present.
  - Search `frontend/src/styles` for `minx` and confirm there are no `~minx` imports or `minx` package assumptions.
  - `cd frontend && npm run build` compiles SCSS after `T006` is complete.
- depends_on: [`T002`]
- notes and open questions:
  - Keep the visual values stable even if the exact SCSS implementation changes from mixins to plain CSS.

### T006 - Port app shell and header styles with local icon/link treatment

- status: `pending`
- goal: Recreate the app main spacing and header layout in target frontend styles without requiring Font Awesome CDN or Typekit.
- t-spec references:
  - Styles and Assets interface mapping
  - Root Shell interface mapping
  - Header UI interface mapping
  - Non-Functional Targets: accessibility, styling continuity, performance
  - TO-BE rules: `TB-S001-R014`, `TB-S001-R022`, `TB-S001-R023`, `TB-S001-R027`, `TB-S001-R028`, `TB-S001-R030`, `TB-S001-R040`
  - Deltas: `D-S001-005`, `D-S001-008`, `D-S001-009`
- files to create or edit:
  - `frontend/src/App.scss` or `frontend/src/app.module.scss`
  - `frontend/src/components/header.module.scss` or equivalent header stylesheet following the convention chosen in `T001`
  - `frontend/src/App.tsx`
  - `frontend/src/components/Header.tsx`
- implementation steps:
  - Preserve `.main` bottom padding of `90px`.
  - Preserve header layout intent: `60px` height, `10px 0` vertical padding, hidden overflow, and `40px` line height.
  - Preserve right-aligned header actions, spacing between action items, and separator intent.
  - Replace Font Awesome mixins/font-family reliance with local CSS, accessible text, inline-safe icons, or an installed icon package if already chosen in `frontend/package.json`.
  - Preserve inherited link color and no-underlined visual intent where appropriate.
  - Ensure icon-only controls or links have accessible names.
- acceptance check:
  - Inspect app/header styles and confirm the main padding, header dimensions, action alignment, separator spacing, and local icon strategy are present.
  - Search `frontend/src` and confirm no required runtime Font Awesome CDN, Typekit, or Material Icons URL remains.
  - Browser inspection or component-level markup inspection confirms the title, GitHub affordance, and sign-out control do not overlap at expected desktop width.
- depends_on: [`T004`, `T005`]
- notes and open questions:
  - The target may use CSS modules or plain SCSS imports, but it should be consistent within this slice.

### T007 - Verify slice exclusions, traceability, and local shell acceptance

- status: `pending`
- goal: Run the final shell-level checks that prove the implemented slice satisfies the TO-BE task scope and does not pull in deferred Firebase/PWA/test-harness behavior.
- t-spec references:
  - Target Scope and Out of Scope
  - Rule Placement by Tier
  - Deltas vs. AS-IS
  - Open Questions and Stage 4 Notes
  - TO-BE rules: `TB-S001-R001` through `TB-S001-R043`
- files to create or edit:
  - No new files expected. Edit prior task files only if this verification finds a concrete acceptance failure.
- implementation steps:
  - Run the frontend install/build checks from the completed tasks.
  - Search target frontend files for forbidden legacy runtime assumptions: Angular bootstrap/imports, Firebase/AngularFire imports, Zone.js/reflect polyfills, `sw-precache`, service-worker registration, external Typekit/Font Awesome/Material Icons runtime URLs, and `href="#"` sign-out behavior.
  - Confirm deferred-slice boundaries are respected: no real auth implementation, no task model/API/page implementation, no backend/Firebase platform replacement, and no full test harness migration.
  - Confirm all `TB-S001-R001` through `TB-S001-R043` are either directly implemented by `T001` through `T006` or intentionally deferred according to `t-spec.md` ownership notes.
  - Record any unresolved blocker in the Stage 5 result instead of expanding this slice scope.
- acceptance check:
  - `cd frontend && npm install`
  - `cd frontend && npm run build`
  - `rg "angular|AngularFire|firebase|zone\\.js|reflect|sw-precache|serviceWorker|Typekit|maxcdn\\.bootstrapcdn|fonts\\.googleapis|icon\\?family=Material|href=\"#\"" frontend` returns no target-runtime violation; expected false positives must be documented with file and reason.
  - Manual traceability review confirms every TO-BE rule in `t-spec.md` is covered by completed tasks or a documented owner/deferment in this slice.
- depends_on: [`T001`, `T002`, `T003`, `T004`, `T005`, `T006`]
- notes and open questions:
  - Do not add Vitest, React Testing Library, Playwright, backend pytest, auth API, task API, or task UI implementation while resolving `T007` failures unless a later slice explicitly owns that work.

## Coverage Summary

| TO-BE rule range | Covered by |
| --- | --- |
| `TB-S001-R001` | `T003`, `T007` |
| `TB-S001-R002` | `T001` |
| `TB-S001-R003` through `TB-S001-R010` | `T002`, `T003` |
| `TB-S001-R011` | `T003` |
| `TB-S001-R012` | `T002`, `T007` |
| `TB-S001-R013` through `TB-S001-R017` | `T003`, `T004` |
| `TB-S001-R018` through `TB-S001-R023` | `T004`, `T006` |
| `TB-S001-R024` through `TB-S001-R030` | `T005`, `T006` |
| `TB-S001-R031` through `TB-S001-R038` | `T001`, `T002`, `T007` |
| `TB-S001-R039` | `T003`, `T007` |
| `TB-S001-R040` | `T004`, `T006`, `T007` |
| `TB-S001-R041` | `T003`, `T007` |
| `TB-S001-R042` through `TB-S001-R043` | `T001`, `T002`, `T003`, `T007` |

## Blockers

None. The Stage 3 open questions for this slice are resolved in `t-spec.md`, and Stage 5 can implement these tasks without reopening the TO-BE specification.
