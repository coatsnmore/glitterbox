# Repository Guidelines

## Project Structure & Module Organization
- Root site: Astro app in `src/` (pages in `src/pages`, components in `src/components`, layouts in `src/layouts`).
- Static assets served from `public/` (e.g., `public/forest`, `public/space`, `public/wellness`).
- Game sources live in `games/*` (independent Vite projects); wellness PWA in `apps/wellness-tracker/`.
- Build output goes to `dist/`.

## Build, Test, and Development Commands
- Root site dev: `npm run dev` — start Astro at `http://localhost:4321`.
- Root build: `npm run build` — generate static site in `dist/`.
- Root preview: `npm run preview` — serve the built site locally.
- Game/app dev (example): `cd games/space-shooter && npm install && npm run dev`.
- Game/app build (example): `npm run build` inside the specific subproject.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; keep lines ≤ 100 chars.
- Astro/CSS/TS: prefer modern, ES modules; avoid unused code.
- Filenames: pages use kebab-case (e.g., `solitaire.astro`), components PascalCase (e.g., `Welcome.astro`).
- Paths: reference embedded games via `/subdir/...` under `public/` (iframe sources).
- Lint/format: some subprojects ship ESLint/Prettier (e.g., `games/space-shooter`); follow each subproject’s config. For the root, match existing style.

## Testing Guidelines
- No centralized test runner in the root Astro site; validate by loading each route locally.
- Subprojects may add unit tests (recommended: Vitest for Vite apps). No repo-wide coverage requirement.
- Smoke test before PR: `npm run dev` (root) and open all game/app pages.

## Commit & Pull Request Guidelines
- Commits: short imperative subject (≤ 72 chars) + focused changes (e.g., "add survival page", "update readme").
- PRs include: purpose, notable changes, affected paths (e.g., `src/pages/*`, `public/*`), screenshots/GIFs for UI, and local test notes.
- Link issues when applicable; keep PRs small and scoped.

## Security & Configuration Tips
- Do not commit secrets; this is a static site. Keep third-party scripts minimal and self-host assets under `public/`.
- When adding new games/apps: place sources under `games/*` or `apps/*`, expose built assets under `public/<name>/`, and add an Astro page in `src/pages/<name>.astro` embedding the entry HTML via an iframe.

