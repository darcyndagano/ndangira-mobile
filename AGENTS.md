## ndangira-mobile

Client mobile de Ndangira : React 18 + Vite 6 + Tailwind 4/shadcn, react-query, zustand, emballé pour Android avec Capacitor 6. Il consomme l'API Django du dépôt voisin `../ndangira` ; règles backend dans `../ndangira/AGENTS.md`.

## Policy

- Work on one branch per epic or story (`feat/…`, `fix/…`), merged into `main` once the build passes; `.githooks/pre-commit` refuses commits on `main` (fresh clone: `git config core.hooksPath .githooks`).

## Where things are

- API calls go through `apiClient` (`src/app/api/client.ts`, JWT + refresh); API responses are wrapped `{success, data, message}` — read `res.data.data`; list endpoints are paginated (`src/app/api/pagination.ts`).
- Auth/session state: `src/store/authStore.ts`; routes: `src/app/routes.tsx`.
- Brand colors are `--ndangira-brown` / `--ndangira-gold` in `src/styles/theme.css`; use them instead of new hardcoded hex values.

## Running and verifying

- pnpm is pinned by `packageManager` (pnpm 11.13.0) and its settings live in `pnpm-workspace.yaml` (pnpm 11 ignores the `"pnpm"` field of `package.json`); on Node 24 run `corepack enable` once, then `pnpm install` and `pnpm build` (≈12 s); there is no typecheck or test script, so the build is the only check.
- `VITE_API_URL` is baked into `dist/` at build time: for a phone, build with `VITE_API_URL=http://<PC LAN IP>:8000`, then `npx cap sync android`; `localhost` on the device is the phone itself. Full procedure (backend on `0.0.0.0:8000`, `ufw`, debug install, rebuild when the IP changes): README section « Tester sur téléphone ».
- Keep the `react()` and `tailwindcss()` plugins in `vite.config.ts` (Figma Make requirement).
