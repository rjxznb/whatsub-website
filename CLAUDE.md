# client-website

Marketing + download landing page for whatSub at **`https://whatsub.eversay.cc/`**. Next.js 14 App Router + Tailwind, **static export** (`output: 'export'`) to plain HTML/CSS/JS. Served by enghub's nginx on the same Aliyun ECS as Eversay (no Node runtime in production — just static files).

> **Companion repos:**
> - License backend: [`rjxznb/whatsub-license`](https://github.com/rjxznb/whatsub-license) — Hono + Postgres on Node 20, exposes `/api/license/*`, `/admin/`, `/download/{win,mac}` on the same domain
> - Desktop app: `client/` (sibling in this repo) — Tauri 2

## Stack

| | |
|---|---|
| Framework | **Next.js 14 + App Router** (matches Eversay's stack) |
| Styling | **Tailwind v3** + brand-tokens-as-CSS-vars |
| Output | **Static export** (`output: 'export'`) → `out/` directory of HTML/CSS/JS, no Node runtime in prod |
| Fonts | **Self-hosted** Caveat (from `client/public/fonts/`, only used for Hero `hey, what'Sub?` signature) + JetBrains Mono (via `@fontsource/*`, used for version chips/mono labels). Body sans is the OS native stack (system-ui → PingFang SC / Microsoft YaHei UI). NOT Google Fonts — fonts.googleapis.com is throttled/MITM'd in mainland China |
| Icons | `lucide-react` |
| TypeScript | strict, `noUncheckedIndexedAccess` |
| Deploy | scp tarball → in-place extract into `/data/whatsub-web/` (bind-mounted into enghub-nginx-1) |

## Layout

```
client-website/
├── package.json                # @whatsub/website, separate pnpm pkg
├── next.config.mjs             # output: 'export', images: { unoptimized: true }
├── tsconfig.json               # strict + paths "@/*": ["./src/*"]
├── tailwind.config.ts          # brand tokens (font-display: Caveat, accent: #3B9BFF)
├── postcss.config.mjs
├── .npmrc                      # registry=https://registry.npmmirror.com (taobao mirror)
├── .gitignore                  # node_modules/ .next/ out/ .env* *.log *.tsbuildinfo
├── public/
│   ├── fonts/Caveat-{Bold,Medium}.woff2     # byte-copied from client/public/fonts/ — only used by HeroSlim
│   ├── favicon.ico                          # copied from client/src-tauri/icons/icon.ico
│   ├── whatsub-icon.png                     # 256×256 square app icon — copied from client/src-tauri/icons/128x128@2x.png. Currently unused in the page (nav uses wordmark) but kept as the canonical square asset (favicon, OG fallback, future use)
│   └── whatsub-wordmark.png                 # ~3:1 wide handwritten "whatSub" wordmark with black background. Used as the nav logo. Black bg blends out via mix-blend-mode: screen so only the white "what" + blue "Sub" letterforms show on top of nav backdrop
└── src/
    ├── app/
    │   ├── layout.tsx          # <html lang="zh"> + Caveat preload + @fontsource/jetbrains-mono import
    │   ├── globals.css         # @font-face Caveat + brand CSS vars + body vignette + .reveal/.visible classes
    │   └── page.tsx            # Renders Nav + HeroSlim + DemoDiagonal + Download + Pricing + FAQ + Footer
    ├── components/
    │   ├── Nav.tsx             # Apple-style frosted glass (rgba(0,0,0,0.55) + backdrop-blur(30px) saturate(180%)). Wordmark logo (left) + 4 anchor links (功能/下载/定价/FAQ) + 购买授权 CTA. Accepts optional `links` prop, default targets [#demo, #download, #pricing, #faq]
    │   ├── HeroSlim.tsx        # Caveat signature "hey, what'Sub?" (Sub blue, hover scale-125 + white text-shadow matching desktop app WelcomeIntro hover) + tagline "让一句字幕，慢慢成为你的英语" + 2 download buttons. No version chip, no preview window
    │   ├── DemoDiagonal.tsx    # Sticky-pinned scroll-driven full-screen demo gallery. Container is N×100vh tall, inner is sticky 100vh; demos stack with z-index 0..N-1, each one >0 has clip-path: polygon(...) animated by scroll progress to do a diagonal-wipe reveal from below. A glowing white beam line (positioned div + rotate + 4-stop white box-shadow) sits along the active wipe diagonal. Uses `lineCoords()` helper (single source of truth for both clip-path polygon corners and beam endpoint coords). Demos are placeholder gradient cards with text caption — swap `<DemoSlot>` body for real GIF/video later
    │   ├── Download.tsx        # 2 platform tiles + version chip + GitHub backup link
    │   ├── Pricing.tsx         # Single-tier card → 小红书 store CTA
    │   ├── FAQ.tsx             # 7 expandable rows (chevron-rotate)
    │   └── Footer.tsx          # © 2026 whatSub + ICP 备案号 + 联系客服
    ├── hooks/
    │   ├── useReveal.ts        # IntersectionObserver — adds .visible to .reveal items on scroll-in
    │   └── useLatestVersion.ts # fetch /api/license/latest → {version, pubDate, winUrl, macUrl} + fallback
    └── lib/
        └── constants.ts        # BRAND, LINKS (xhsStore, githubReleases, icpRecord), PRICING (¥99 placeholder)
```

## Brand tokens

Source of truth: `client/src/components/WelcomeIntro.tsx` (the desktop app's intro animation). Mirrored here as CSS variables in `globals.css` + Tailwind classes in `tailwind.config.ts` + TS exports in `lib/constants.ts`. **All three must agree** — if you change one, change all three.

| Token | Value | Usage |
|---|---|---|
| `--bg` / `bg-bg` | `#000000` | Page canvas |
| `--bg-soft` / `bg-bg-soft` | `#0a0a0c` | Alternating section bg (rhythm) |
| `--bg-elev` / `bg-bg-elev` | `#141418` | Cards |
| `--ink` / `text-ink` | `#ffffff` | Primary text |
| `--ink-soft` | `rgba(255,255,255,0.72)` | Body |
| `--ink-muted` | `rgba(255,255,255,0.48)` | Secondary |
| `--ink-faint` | `rgba(255,255,255,0.30)` | Timestamps / mono labels |
| `--accent` / `text-accent` | `#3B9BFF` | "Sub" wordmark, CTA buttons, single accent word per section title |
| `--accent-glow` | `rgba(59,155,255,0.35)` | text-shadow + buttons box-shadow |
| `--amber` / `text-amber` | `#FCD34D` | English highlight word underline (in subtitle preview) |

Font CSS classes: `font-display` = Caveat (kept ONLY for the Hero "hey, what'Sub?" signature + Nav logo wordmark, not for section titles — section titles use system sans for clean Chinese rendering), `font-mono` = JetBrains Mono (timestamps, version chips, decorative big numbers), default = system-ui sans stack (body, all titles).

Body has a layered radial vignette + 4%-opacity dotted grid (32px) baked into globals.css.

## Local dev

```bash
cd client-website
pnpm install              # via taobao mirror (.npmrc), ~30s
pnpm dev                  # http://localhost:3000 — hot reload
pnpm typecheck            # tsc --noEmit, must be clean
pnpm build                # → out/ (static export)
pnpm lint                 # next lint
```

In dev mode, `useLatestVersion()` will fail to fetch `/api/license/latest` (no backend on :3000) and fall back to a hardcoded `{version: '0.1.26', winUrl: null, macUrl: null}`. Production hits the live whatsub-license backend.

## Build + deploy

`pnpm build` produces a `out/` directory of static files. Deploy by copying those files into `/data/whatsub-web/` on the Aliyun server, which is bind-mounted into the enghub-nginx-1 container.

```bash
# Local
cd client-website
pnpm build
tar czf /tmp/whatsub-web.tar.gz -C out .

# Ship
scp -i ~/.ssh/id_ed25519 /tmp/whatsub-web.tar.gz root@47.93.87.206:/tmp/

# Apply on server (in-place extract — preserves directory inode)
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 "
  rm -rf /data/whatsub-web/* &&
  tar xzf /tmp/whatsub-web.tar.gz -C /data/whatsub-web/ &&
  rm /tmp/whatsub-web.tar.gz
"

# Verify
curl -sI https://whatsub.eversay.cc/ | head -3
```

**No nginx restart needed** for static-file replacement. The bind mount picks up filesystem changes live as long as the directory inode doesn't change (we extract in-place, not via mv-rename).

## Server topology

```
443 → enghub-nginx-1 (in /opt/enghub/docker-compose.yml)
       │
       ├ /api/license/*  → proxy_pass → whatsub-license:3002/api/* (Hono backend)
       ├ /download/*     → proxy_pass → whatsub-license:3002/download/*
       ├ /admin/*        → proxy_pass → whatsub-license:3002/admin/*
       └ /               → static file serve from /data/whatsub-web/  ← THIS PROJECT
```

nginx config lives at `/data/nginx-conf.d/whatsub.conf` (sibling to enghub's eversay.conf in the same shared directory). Source of truth: `whatsub-license/nginx/whatsub.conf` in the standalone whatsub-license repo (not in this repo — historical reason: the conf was authored alongside the license backend).

## Key design decisions (and why)

1. **Static export, not SSR.** The page is fully static — no per-request server work. Static export means we ship plain HTML/JS to nginx and avoid running a Node process in prod (saves the Aliyun box's 3.4 GB RAM for things that actually need it). Loses ISR/dynamic routes; we don't need those.

2. **Self-hosted fonts (NOT Google Fonts).** `fonts.googleapis.com` is throttled and sometimes MITM'd in mainland China — Chrome flagged the entire page as `不安全` because the third-party CSS request returned a cert error (some intermediate's MITM cert). Bundling fonts via `@fontsource/inter` + `@fontsource/jetbrains-mono` + the woff2 files we already have for Caveat sidesteps that. Adds ~1 MB to the bundle but it's served from the same mainland-direct nginx so the user doesn't notice.

3. **Caveat copied byte-for-byte from desktop app.** `public/fonts/Caveat-{Bold,Medium}.woff2` is a literal copy of `client/public/fonts/Caveat-{Bold,Medium}.woff2`. The wordmark in this site MUST be pixel-identical to the wordmark in the desktop app's WelcomeIntro animation — same hinting, same metrics, same rendering. Don't substitute another version of Caveat or use Google Fonts' Caveat (the file content differs).

4. **Brand tokens duplicated 3 ways** — Tailwind theme, CSS variables, TS exports. This is intentional: Tailwind enables `bg-accent` / `text-ink` shorthand, CSS vars enable arbitrary `style={{ ... }}` use + `--ink-soft` text colors, TS exports enable typed component code. All three need to stay in sync; the source of truth is `client/src/components/WelcomeIntro.tsx` lines 30-37.

5. **5 sections, 1 page, no routing.** The whole site is a single scrollable `page.tsx`: HeroSlim → DemoDiagonal → Download → Pricing → FAQ → Footer. Nav menu items are anchor scrolls, not router pushes. Simpler than Next router for this use case + matches user's mental model (the buyer reads top-to-bottom). Earlier iterations had separate WhyCards / HowSteps / FeatureGrid sections — these were collapsed into the single full-screen DemoDiagonal gallery once we admitted that "show, don't tell" works better than 3 stacked grids of marketing copy when the product is visual.

10. **DemoDiagonal scroll-driven wipe.** The "what does this product do" section is a stack of full-screen demos that wipe in via diagonal masks driven by scroll position (sticky-pinned 100vh inner inside an N×100vh outer; clip-path polygons animated per scroll progress; a glowing white beam line drawn along the active diagonal). Two reasons: (a) for a visual product like a subtitle player the screenshots ARE the pitch, dedicating one whole viewport per demo lets each one breathe; (b) the diagonal wipe is distinctive enough to be memorable without being cute. The placeholder cards (gradient + caption) are designed to be swapped 1-for-1 with real GIFs/videos by editing the `<DemoSlot>` body — the diagonal mechanic doesn't care what's inside.

11. **Apple-style frosted glass nav.** Nav uses `backgroundColor: rgba(0,0,0,0.55)` + `backdropFilter: blur(30px) saturate(180%)` (with `-webkit-` prefix) — same recipe as macOS sidebar / iOS toolbar. The 180% saturation is the signature touch that makes the blurred-through content look richer rather than washed out. Always-on (no scroll-state toggle) so the look is consistent.

12. **Wordmark logo via mix-blend-mode.** The nav logo is `whatsub-wordmark.png`, a wide PNG of the handwritten "whatSub" wordmark on a baked-in BLACK background (transparency was not exported from the source). To make it sit cleanly on the nav's frosted backdrop, the `<img>` gets `mix-blend-mode: screen` — black pixels in screen-blend mode become transparent (output = bg unchanged), so only the white "what" and blue "Sub" letterforms are visible. A radial-gradient white-glow span behind the image gives the wordmark a soft "lit from behind" feel. Don't replace the wordmark with one that has a transparent bg without removing the blend-mode + glow.

6. **`useLatestVersion()` lives in the website, calls the license backend at `/api/license/latest`.** Same-origin so no CORS dance. Falls back to a hardcoded `0.1.26` on fetch error so the page never breaks even when the backend is down. The hardcoded value should be bumped alongside each release, but it's only a cosmetic fallback — the real version + URLs come from the live API.

7. **Placeholder screenshots are SVG, not PNG.** `public/screenshots/*.svg` is 7 gray-gradient boxes with labels in Chinese. SVG was chosen because it scales infinitely + tiny file size + doesn't need ImageMagick to generate. User swaps real PNG/GIF screenshots in later (keep the same filenames so it's a drop-in replacement).

8. **Deploy via in-place file replacement, NOT directory rename.** Past us tried `mv /data/whatsub-web /data/whatsub-web.old; mv whatsub-web.new whatsub-web` and broke the docker bind mount (container kept pointing at the old inode). The in-place extract (`rm -rf .../* && tar xzf ... -C .../`) preserves the directory inode so the bind mount stays valid. See deploy section above.

## Gotchas (we hit these; check first if a similar symptom shows up)

- **Chrome shows `此页面不安全 (HTTPS 连接断开)` despite valid cert.** Look at DevTools → Security tab. If it says "资源 - 出现证书错误的活动内容", the issue is a third-party HTTPS resource with cert error (Google Fonts in mainland China is the usual culprit). Fixed by self-hosting all fonts via `@fontsource/*`.

- **Build outputs `dist/src/index.js` instead of `dist/index.js`.** Different project, different Dockerfile — applies to whatsub-license, not this repo. But same root cause: tsc's auto-inferred `rootDir` from `include` glob. We don't use tsc to emit here (Next.js does the bundling), so this doesn't apply.

- **`tsconfig.tsbuildinfo` getting tracked by git.** TS incremental build cache file. Add `*.tsbuildinfo` to `.gitignore` (already done at PB5+1) and `git rm --cached client-website/tsconfig.tsbuildinfo` if it ever gets staged.

- **Atomic mv-rename breaks docker bind mounts.** Don't use `mv old new; mv new.tmp new` for the `/data/whatsub-web` deploy. Use in-place extract instead. (See deploy section.)

- **Hero animation not firing on second navigation.** `useReveal` uses `IntersectionObserver` with `unobserve` after first intersection. If the user scrolls the Hero out and back in, it stays visible (the `.visible` class persists). Intentional — re-firing the fade-in on every scroll-in is gimmicky.

- **Mobile layout: subtitle preview window stacks below text instead of side-by-side.** Intentional. We use `grid-cols-1` everywhere except a few places where `lg:grid-cols-2` kicks in at 1024px+. Side-by-side on phones makes the preview window unreadably small.

- **Section titles wrap onto 3 lines on narrow viewports.** Each title's font size uses `clamp(40px, 6vw, 72px)` — at 360px width it lands around 40px which is still big. Some Chinese titles wrap to 2-3 lines. Acceptable; alternatives (smaller min size, ellipsis, char-by-char animation) all looked worse.

- **Diagonal beam line clip-path math has TWO consumers.** `lineCoords(progress)` in DemoDiagonal returns `{leftY, rightY}` (in 0–100 percentages) at the current wipe progress. Both `clipPathFor()` (which builds the polygon for the demo layer's clip-path) AND the `<BeamLine>` component (which positions the glowing line sprite) call into it. Don't change one without the other or the visible white beam will drift away from the actual wipe boundary.

- **DemoDiagonal computes screen-space coords from `window.innerWidth/innerHeight`.** This is updated in the same scroll-RAF callback that updates `progress[]`. If you add a new responsive feature inside DemoDiagonal that needs the container dimensions, read from the existing `vp` state — don't add another resize listener.

- **`pnpm install` slow without taobao mirror.** `.npmrc` in this directory pins `registry=https://registry.npmmirror.com`. Don't delete it — the international npmjs registry is unreliable from mainland.

## Quick map

| Task | File |
|------|------|
| Tweak Hero copy / tagline | `src/components/HeroSlim.tsx` |
| Add or change a demo slot in the diagonal gallery | `src/components/DemoDiagonal.tsx` — edit `DEMOS` array (caption + future image src). Total scroll height auto-grows as N grows |
| Replace a demo placeholder with a real GIF/video | `src/components/DemoDiagonal.tsx` — swap the `<DemoSlot>` body. Mechanic (clip-path + beam) doesn't care about content |
| Tune the diagonal slope or beam glow | `src/components/DemoDiagonal.tsx` — `SLOPE_OFFSET` (degrees of slope) and the inline `boxShadow` on `<BeamLine>` |
| Add an FAQ row | `src/components/FAQ.tsx` — append to `QUESTIONS` array |
| Change pricing | `src/lib/constants.ts` — `PRICING.amount` and `PRICING.features` |
| Change 小红书 store URL | `src/lib/constants.ts` — `LINKS.xhsStore` |
| Add a new section | new component in `src/components/` + import + render in `src/app/page.tsx`. If it should appear in the nav, add an entry to `Nav`'s links prop |
| Tune brand colors | edit all 3: `tailwind.config.ts` + `src/app/globals.css` + `src/lib/constants.ts` |
| Adjust scroll-reveal timing | `src/app/globals.css` (transition duration) + `src/hooks/useReveal.ts` (IntersectionObserver threshold/rootMargin) |

## What's NOT here (deliberately out of scope)

- English version (i18n hooks not wired; would need `next-intl` or similar)
- Real testimonials (none yet — placeholder block in spec was deleted)
- Founder story (overkill for desktop tool; cut from spec)
- Scenarios (Eversay-specific 18 scenes; doesn't apply to whatSub)
- "Why" cards / "How it works" steps / "Features" grid — these existed in earlier iterations and were collapsed into DemoDiagonal. Don't add them back as separate sections — if the product needs more explanation than 4 demo slots can carry, the right move is to expand the DemoDiagonal demos (more slots, longer captions) rather than reintroduce "show + tell" duplication
- Analytics
- A/B testing
- Direct payment / Stripe / Wechat Pay (purchase flows through 小红书 store link)
- CMS-driven content (everything is hard-coded — change the .tsx files)
