# @whatsub/website

Marketing + download landing page for whatSub at <https://whatsub.eversay.cc/>.

- Next.js 14 (App Router) + Tailwind v3
- Static export (`output: 'export'`) — produces plain HTML/CSS/JS, no Node
  runtime in production
- Deployed to `/data/whatsub-web/` on the Aliyun ECS, served by enghub's nginx

## Quick start

Requires **Node ≥ 18.17** (LTS 20 recommended — see `.nvmrc`) and **pnpm ≥ 8**.

```bash
pnpm install     # ~30s via taobao mirror (.npmrc tracked)
pnpm dev         # http://localhost:3000
pnpm typecheck   # must be clean
pnpm build       # → out/
```

In dev, `/api/license/*` and `/download/{win,mac,plugin}` will 404 because
those are nginx-proxied to the license backend in production. The hero,
videos, cards, and all visual content render fine — only the actual download
clicks 404. `useLatestVersion()` falls back to a hardcoded version chip when
the backend is unreachable.

## Deploy

`pnpm build` produces `out/`; ship it to the server in-place to preserve the
docker bind-mount inode. SSH key required. See **`CLAUDE.md` § Build + deploy**
for the full runbook.

## Project docs

**Read [`CLAUDE.md`](./CLAUDE.md)** — the canonical doc for this codebase:
file-by-file layout, brand tokens, key design decisions, server topology,
known gotchas, and a quick-map for common edits.

## Companion repos

- License backend: [`rjxznb/whatsub-license`](https://github.com/rjxznb/whatsub-license) — Hono + Postgres, hosts `/api/license/*` + `/admin/` + `/download/*` on the same domain
- iOS app: `whatsub-mobile` — SwiftUI + StoreKit 2 (App Store `id6771697837`)
- Browser plugin: `whatsub-plugin` — same codebase shipped to Edge Add-ons and Chrome Web Store
- Desktop app: `client/` — Tauri 2 (sibling to this repo on the original dev machine)
