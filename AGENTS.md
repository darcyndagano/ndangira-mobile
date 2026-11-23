<!-- bmad:context -->
<!-- Verified 2026-11-23 against de0c95a. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## ndangira-mobile

Client mobile de Ndangira : React 18 + Vite 6 + Tailwind 4/shadcn, react-query, zustand, emballé pour Android avec Capacitor 6. Il consomme l'API Django du dépôt voisin `../ndangira` ; planification BMAD et règles backend dans `../ndangira/AGENTS.md` et `../ndangira/_bmad-output/`.

## Policy

- Work on one branch per epic or story (`feat/…`, `fix/…`), merged into `main` once the build passes; `.githooks/pre-commit` refuses commits on `main` (fresh clone: `git config core.hooksPath .githooks`).

## Where things are

- API calls go through `apiClient` (`src/app/api/client.ts`, JWT + refresh); API responses are wrapped `{success, data, message}` — read `res.data.data`; list endpoints are paginated (`src/app/api/pagination.ts`).
- Auth/session state: `src/store/authStore.ts`; routes: `src/app/routes.tsx`.
- Brand colors are `--ndangira-brown` / `--ndangira-gold` in `src/styles/theme.css`; use them instead of new hardcoded hex values.

## Running and verifying

- Default Node (24) has no pnpm: run `PATH=~/.nvm/versions/node/v22.13.0/bin:$PATH pnpm build` (≈12 s); there is no typecheck or test script, so the build is the only check.
- `VITE_API_URL` is baked into `dist/` at build time: for a phone, build with `VITE_API_URL=http://<PC LAN IP>:8000`, then `npx cap sync android`; `localhost` on the device is the phone itself.
- Keep the `react()` and `tailwindcss()` plugins in `vite.config.ts` (Figma Make requirement).

## Known pitfalls

- The root `.gitignore` ignores `app`, `gradle`, `*.gradle` names at any depth: new files under `android/` are silently untracked — check `git status --ignored android/` after adding native files.

<!-- /bmad:context -->
