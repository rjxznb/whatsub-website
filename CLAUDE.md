# client-website

Marketing + download landing page for whatSub at **`https://whatsub.eversay.cc/`**. Next.js 14 App Router + Tailwind, **static export** (`output: 'export'`) to plain HTML/CSS/JS. Served by enghub's nginx on the same Aliyun ECS as Eversay (no Node runtime in production — just static files).

> **Status as of 2026-06-20:** Production live with three pricing tiers (免费 ¥0 / 一次买断 ¥59.9 / 订阅 Pro ¥22月 · ¥168年) and four endpoint surfaces — desktop client + iOS app + Edge add-on + Chrome extension, all linked from the same homepage. Backend: Alipay 电脑网站支付 v3 (买断 + 订阅 product split via `product` field on create-order), QQ SMTP for license delivery, license backend hosts public `/api/license/*` + admin + download redirects on the same domain.

> **Companion repos:**
> - License backend: [`rjxznb/whatsub-license`](https://github.com/rjxznb/whatsub-license) — Hono + Postgres on Node 20, exposes `/api/license/*`, `/admin/`, `/download/{win,mac,plugin}` on the same domain
> - Desktop app: `client/` (sibling in this repo) — Tauri 2
> - iOS app: `whatsub-mobile/` (separate repo) — SwiftUI + StoreKit 2, App Store CN listing `id6771697837` (live as of 2026-06-10)
> - Browser plugin: `whatsub-plugin/` (separate repo) — same codebase shipped to Edge Add-ons (`nnimcmjcjapacadannjbfdhkpklnbekj`) and Chrome Web Store (`cpakpiimpppgedidmoohddhfcpjjkjha`), both live as of 2026-06-10

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
│   ├── videos/{m1..m4,p1..p3,part1..part3}.{mp4,jpg}  # demo clips for DemoDiagonal (homepage) + MobileShowcase (/mobile) + PluginShowcase (/plugin). ~14 MB total, all tracked in git
│   ├── whatsub-icon.png                     # 256×256 square app icon — copied from client/src-tauri/icons/128x128@2x.png. Currently unused in the page (nav uses wordmark) but kept as the canonical square asset (OG fallback, future use)
│   ├── whatsub-wordmark.png                 # ~3:1 wide handwritten "whatSub" wordmark with black background. Used as the nav logo. Black bg blends out via mix-blend-mode: screen so only the white "what" + blue "Sub" letterforms show on top of nav backdrop
│   └── og.png                               # OpenGraph share preview image
└── src/
    ├── app/
    │   ├── favicon.ico         # 32×32 site favicon — Next 14 auto-detects this colocated at src/app/ (no <link> tag in layout.tsx needed)
    │   ├── icon.png            # 512×512 high-res app icon — Next 14 auto-detects and emits PWA-style <link rel="icon" type="image/png"> tags
    │   ├── layout.tsx          # <html lang="zh"> + Caveat preload + @fontsource/jetbrains-mono import. No explicit `icons` metadata block — relies on the auto-detected favicon.ico + icon.png above
    │   ├── globals.css         # @font-face Caveat + brand CSS vars + body vignette + .reveal/.visible classes
    │   ├── page.tsx            # Renders Nav + HeroSlim + DemoDiagonal + Download + CombinedPricing + FAQ + Footer. ComingSoon was dropped 2026-06-10 once iOS shipped — only Mac App Store + Android remained genuinely pending, not worth a section on its own
    │   ├── mobile/
    │   │   └── page.tsx        # /mobile page — MobileShowcase (Hero with App Store CTA + 4 feature clips + scenarios + FAQ) followed by Free + Pro pricing cards side by side. `#pro` anchor preserved for deep-links from the desktop client's quota dialogs even though the card now lives on home too
    │   ├── plugin/
    │   │   └── page.tsx        # /plugin page — PluginShowcase (Hero with Edge + Chrome store CTAs + feature gallery + quick start + scenarios + FAQ + cross-promo to desktop/mobile)
    │   ├── platforms/
    │   │   └── page.tsx        # /platforms page — PlatformsOverview (per-scenario picker + closed-loop diagram + per-end capability cards)
    │   └── payment/
    │       └── success/
    │           └── page.tsx    # Polling success page — reads ?out_trade_no=... after Alipay return_url, polls /api/license/payment/status/:no every 1.5s. Branches on the `product` field: sub_month/sub_year → "订阅已开通 · {月度|年度}" + SubActivationGuide (log in with same email on any client); buyout → license key + ActivationGuide. 60s timeout → "联系客服". Wraps useSearchParams() consumer in <Suspense> for static export
    ├── components/
    │   ├── Nav.tsx             # Apple-style frosted glass (rgba(0,0,0,0.55) + backdrop-blur(30px) saturate(180%)). Wordmark logo (left) + 4 anchor links (功能/下载/定价/FAQ, desktop-only md:flex) + PlatformsDropdown (visible on both desktop and mobile) + 购买授权 CTA which scrolls to #pricing. Mobile gap reduced to gap-3 to fit logo + dropdown + CTA on a 375px screen. Accepts optional `links` prop, default targets [#demo, #download, #pricing, #faq]
    │   ├── HeroSlim.tsx        # Caveat signature "hey, what'Sub?" (Sub blue, hover scale-125 + white text-shadow matching desktop app WelcomeIntro hover) + CN tagline "让一句字幕，慢慢成为你的英语" + 2 download buttons + a 24h-trial pill below the CTAs with a Clock icon: "下载即享 24 小时免费试用 · 满意再付款". Replaced the earlier ShieldCheck "100% 本地处理" badge (2026-06) — the 24h-trial signal closes the visual gap between "downloads" and "buy now" more directly. No version chip, no preview window
    │   ├── DemoDiagonal.tsx    # Sticky-pinned scroll-driven full-screen demo gallery. Container is N×100vh tall, inner is sticky 100vh; demos stack with z-index 0..N-1, each one >0 has clip-path: polygon(...) animated by scroll progress to do a diagonal-wipe reveal from below. A glowing white beam line (positioned div + rotate + 4-stop white box-shadow) sits along the active wipe diagonal. Uses `lineCoords()` helper (single source of truth for both clip-path polygon corners and beam endpoint coords). Demos now have real video clips (/videos/part{1,2,3}.mp4) — swap `<DemoSlot>` `videoSrc` to replace
    │   ├── Download.tsx        # 2 platform tiles (Windows / macOS) for the Tauri desktop client at the top + a "现已支持" 3-card grid below (App Store / Edge 加载项 / Chrome 应用商店, separated by a hairline border-t pt-12). Desktop tiles' primary CTA → `/download/{win,mac}` (backend 302 → jihulab latest.json) + small "GitHub 备用下载" fallback link. "现已支持" cards are entire-card-clickable `<a target="_blank">` links going to the respective store URLs (LINKS.iosAppStore / edgeAddonStore / chromeAddonStore). The earlier "配套浏览器插件" tile with the two store buttons + GitHub backup was collapsed into the grid 2026-06-10 once both stores went live — the grid says "we ship on these endpoints" rather than "here's a fallback for an extension"
    │   ├── CombinedPricing.tsx # Home-page pricing module — 3 tiers in one section (免费 / 买断 / 订阅 Pro), each a `*Card variant="compact"` so they share visual geometry. Section heading "免费 / 买断 / 订阅，按需选其一" + 3 short intro paragraphs (one per tier, with bolded label + "需要注意" muted disclaimer addressing the real downside of that tier). Replaced separate Pricing + ProSubscriptionCard sections (was previously two near-identical "pricing" sections back-to-back; Free was added 2026-06-08 after feedback that visitors couldn't see what they get without paying)
    │   ├── Pricing.tsx         # Desktop 永久买断 ¥59.9 card. Email form + 立即购买 → /api/license/payment/create-order → Alipay redirect. Promo/coupon system (URL ?promo=XHS_EARLY for 粉丝早鸟价, manual STU-XXXXXX student codes). Bottom of card has 2 trust lines (software-not-content disclaimer + xhs fallback link). Reads PRICING constants. On home, mounted inside CombinedPricing as the middle card via `variant='compact'`; the `'standalone'` variant has a section wrapper for use outside CombinedPricing if ever needed
    │   ├── FreeTierCard.tsx    # ¥0 免费档 card — green emerald chip (vs Pro's blue accent) for "this is the entry tier" recognition. Same rounded-2xl / padding / border as Pricing + ProSubscriptionCard so all three cards align in the 3-col grid. No purchase form — just a footer line "iOS 安装即生效 · 不用注册付费 · 三端同步默认开启" since MobileShowcase already carries the App Store CTA. Reads FREE_TIER constants
    │   ├── ProSubscriptionCard.tsx # whatSub Pro 月/年 订阅 card. Month/year toggle (year default flagged 省 40%), email → createOrder(email, undefined, 'sub_month'|'sub_year') → Alipay redirect. Reads SUBSCRIPTION constants. **Buyout-holder auto 8 折**: if the buyer enters an email that owns a desktop buyout license, the card detects it server-side and applies an 8 折 discount automatically. Mounted on both / (right card in CombinedPricing) and /mobile (right card in /mobile pricing block); `#pro` anchor still works on /mobile for desktop quota-dialog deep links
    │   ├── FAQ.tsx             # 11 expandable rows (chevron-rotate). Differentiation Q first (视频包 vs software). 2026-06-04 added 3 new tier-help rows after Q1: "买断 vs 订阅 怎么选", "自选 AI 服务怎么用 + 费用多少", "订阅 Pro 到期后桌面端 + 数据还在吗" — these clarify the plain-language CombinedPricing copy
    │   ├── ComingSoon.tsx      # Card grid for genuinely-pending platforms (Mac App Store + Android). No longer mounted on / since iOS shipped 2026-06-10 (page.tsx no longer imports it); component kept in repo for future use — when Mac App Store or Android ships, just remount in page.tsx
    │   ├── PlatformsDropdown.tsx # Shared "平台与集成" dropdown used by every page's nav. Click-to-toggle (not hover) so it works identically on desktop and mobile. Tap-outside closes via pointerdown listener attached only while open. Trigger renders as ghost pill button on mobile + inline text+chevron on md+ (same component handles both via responsive class). Items: 概览 / 最佳实践 / 桌面客户端 / 浏览器插件 / 移动端
    │   ├── PlatformsOverview.tsx # /platforms page content — per-scenario picker table ("场景 → 平台") + cross-device closed-loop diagram + per-end capability cards with CTAs. Move the mobile card's `soon` flag in/out as platforms ship
    │   ├── PluginShowcase.tsx  # /plugin page content — Hero with Edge + Chrome store buttons + 3-feature gallery (双语字幕 / 划词收藏 / 多端同步语料库) + 5-step quick start (incl. AI API key config) + 3-scenario card + 6 FAQ rows + cross-promo final CTA (看桌面客户端 + 看移动端). Both Edge and Chrome buttons are live store links since 2026-06-10
    │   ├── MobileShowcase.tsx  # /mobile page content — Hero with App Store download button + 4-feature gallery (导入+精读 / 词汇本 / 多端语料库 / 云端同步视频) + 3-step "怎么用起来" sequence + 3-scenario card + 5 FAQ rows + cross-promo final CTA (App Store + 了解浏览器插件)
    │   ├── Icons.tsx           # Custom inline SVGs for WindowsLogo + AppleLogo (not in lucide); imported by Download, HeroSlim, MobileShowcase, ComingSoon
    │   └── Footer.tsx          # © 2026 whatSub + ICP 备案号 + 联系客服 + 条款 + 隐私
    ├── hooks/
    │   ├── useReveal.ts        # IntersectionObserver — adds .visible to .reveal items on scroll-in
    │   ├── useLatestVersion.ts # fetch /api/license/latest → {version, pubDate, winUrl, macUrl} + fallback
    │   └── usePromotion.ts     # URL-param / coupon-code promo state — applies XHS_EARLY 早鸟价 via ?promo= param, STUDENT codes via manual input. Persists across reloads via sessionStorage so a returning buyer keeps their early-bird price
    └── lib/
        ├── constants.ts        # BRAND tokens + LINKS (xhsStore, githubReleases, jihulabReleases, edgeAddonStore, chromeAddonStore, iosAppStore, jihulabPluginPackages, githubPluginReleases, supportXhs, icpRecord, icpUrl) + PRICING (desktop buyout ¥59.9, originalAmount ¥99.9, 7-bullet features including "8 折 Pro 升级" perk) + SUBSCRIPTION (Pro tier — monthlyAmount '¥22' / yearlyAmount '¥168' / yearlySavingsLabel '比月付省 ¥96 (约 36% off)' / 8-bullet features incl. AI 视频解析月度 130 次 + per-video 500MB/60min cap + 三端共用) + FREE_TIER (¥0 entry — 200K AI token体验额度 / 3 cloud videos / 100MB/20min per video / 50 corpus entries / iOS+plugin永久免费 + 桌面 24h 试用)
        └── payment-api.ts      # Fetch wrappers for /api/license/payment/{create-order, status/:no, validate-promo}. createOrder(email, promoCode?, product?) — product is 'sub_month'|'sub_year' for the Pro card, omit for buyout. PaymentStatusPaid has nullable licenseKey + nullable product so the success page can branch (buyout shows licenseKey, sub shows "订阅已开通")
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

5. **4 sections + 3 dedicated subpages, no SPA routing.** The home `page.tsx` is a single scrollable: HeroSlim → DemoDiagonal → Download (incl. "现已支持" 3-card grid) → CombinedPricing → FAQ → Footer. Nav menu items are anchor scrolls within home; "平台与集成" dropdown navigates to the 3 dedicated subpages (`/plugin`, `/mobile`, `/platforms`). Earlier iterations had separate WhyCards / HowSteps / FeatureGrid sections — collapsed into DemoDiagonal once we admitted "show, don't tell" works better than 3 stacked grids of marketing copy when the product is visual. ComingSoon was removed 2026-06-10 when iOS shipped — only Mac App Store + Android remained, not section-worthy on their own.

10. **DemoDiagonal scroll-driven wipe.** The "what does this product do" section is a stack of full-screen demos that wipe in via diagonal masks driven by scroll position (sticky-pinned 100vh inner inside an N×100vh outer; clip-path polygons animated per scroll progress; a glowing white beam line drawn along the active diagonal). Two reasons: (a) for a visual product like a subtitle player the screenshots ARE the pitch, dedicating one whole viewport per demo lets each one breathe; (b) the diagonal wipe is distinctive enough to be memorable without being cute. The placeholder cards (gradient + caption) are designed to be swapped 1-for-1 with real GIFs/videos by editing the `<DemoSlot>` body — the diagonal mechanic doesn't care what's inside.

11. **Apple-style frosted glass nav.** Nav uses `backgroundColor: rgba(0,0,0,0.55)` + `backdropFilter: blur(30px) saturate(180%)` (with `-webkit-` prefix) — same recipe as macOS sidebar / iOS toolbar. The 180% saturation is the signature touch that makes the blurred-through content look richer rather than washed out. Always-on (no scroll-state toggle) so the look is consistent.

12. **Wordmark logo via mix-blend-mode.** The nav logo is `whatsub-wordmark.png`, a wide PNG of the handwritten "whatSub" wordmark on a baked-in BLACK background (transparency was not exported from the source). To make it sit cleanly on the nav's frosted backdrop, the `<img>` gets `mix-blend-mode: screen` — black pixels in screen-blend mode become transparent (output = bg unchanged), so only the white "what" and blue "Sub" letterforms are visible. A radial-gradient white-glow span behind the image gives the wordmark a soft "lit from behind" feel. Don't replace the wordmark with one that has a transparent bg without removing the blend-mode + glow.

6. **`useLatestVersion()` lives in the website, calls the license backend at `/api/license/latest`.** Same-origin so no CORS dance. Falls back to a hardcoded `0.1.26` on fetch error so the page never breaks even when the backend is down. The hardcoded value should be bumped alongside each release, but it's only a cosmetic fallback — the real version + URLs come from the live API.

7. **Placeholder screenshots are SVG, not PNG.** `public/screenshots/*.svg` is 7 gray-gradient boxes with labels in Chinese. SVG was chosen because it scales infinitely + tiny file size + doesn't need ImageMagick to generate. User swaps real PNG/GIF screenshots in later (keep the same filenames so it's a drop-in replacement).

8. **Deploy via in-place file replacement, NOT directory rename.** Past us tried `mv /data/whatsub-web /data/whatsub-web.old; mv whatsub-web.new whatsub-web` and broke the docker bind mount (container kept pointing at the old inode). The in-place extract (`rm -rf .../* && tar xzf ... -C .../`) preserves the directory inode so the bind mount stays valid. See deploy section above.

13. **Pricing has an email form, not a static link.** The 立即购买 button posts to `/api/license/payment/create-order` with the buyer's email; the response includes a redirect URL the browser navigates to (Alipay 收银台). On successful payment, Alipay returns the user to `/payment/success?out_trade_no=...`, which polls our backend for the minted license key. 小红书 entry is preserved as a small fallback link in case the Alipay path has issues. License delivery is dual-channel (on-screen + email) — see `docs/superpowers/specs/2026-05-10-alipay-payment-design.md` for the notify + query-fallback mint flow.

14. **Differentiation messaging — FAQ + Pricing card carry "视频包" framing.** Competitors sell ¥9.9/¥19.9 bundles of pirated YouTube videos with bilingual subtitles. We sell software that processes the buyer's own legally-accessed YouTube. The distinction lives at two surviving touchpoints: Pricing card bottom (`软件授权 · 不含视频内容 · 无版权风险`, ink-muted) and FAQ first row (`这和那些卖「英语学习视频包」的有什么不同？` — full answer explains piracy vs software-as-tool). The Hero badge that previously carried "我们重视版权 · 100% 本地处理" was replaced 2026-06 with a 24h-trial signal (Clock icon + "下载即享 24 小时免费试用 · 满意再付款") — the 24h trial proved a more direct conversion hook than the abstract copyright pitch. **Don't soften the FAQ wording**; the explicit naming of "视频包" is load-bearing for the differentiation.

15. **Production deploy state (as of 2026-06-20):**
    - Frontend live at `https://whatsub.eversay.cc/` (static export → /data/whatsub-web/ on Aliyun ECS, bind-mounted into enghub-nginx-1)
    - Backend (`whatsub-license` repo) live at /api/license/* with **production Alipay APPID `2021006152636857`** and **production gateway `https://openapi.alipay.com/gateway.do`** (handles both buyout + monthly/yearly subscription products via `product` field on create-order)
    - SMTP: QQ `2216681472@qq.com` via `smtp.qq.com:465` (auth code in `/opt/whatsub/.env`)
    - License keys mint format: `WHATSUB-XXXX-XXXX-XXXX-XXXX`, 3-device limit, lifetime no-revocation
    - Pricing: 免费 ¥0 (instant install) / 一次买断 ¥59.9 (original ¥99.9 anchor) / 订阅 Pro ¥22 月 · ¥168 年. Buyout buyers get auto 8 折 on Pro subscription via email match
    - iOS app live on App Store CN (id6771697837) since 2026-06-10; browser plugin live on Edge Add-ons + Chrome Web Store since 2026-06-10 — both auto-update via their respective stores, the `/download/plugin` backend redirect (JihuLab → GitHub fallback chain) is no longer surfaced from the website but the route stays in the license backend for last-ditch recovery

## Gotchas (we hit these; check first if a similar symptom shows up)

- **Chrome shows `此页面不安全 (HTTPS 连接断开)` despite valid cert.** Look at DevTools → Security tab. If it says "资源 - 出现证书错误的活动内容", the issue is a third-party HTTPS resource with cert error (Google Fonts in mainland China is the usual culprit). Fixed by self-hosting all fonts via `@fontsource/*`.

- **Build outputs `dist/src/index.js` instead of `dist/index.js`.** Different project, different Dockerfile — applies to whatsub-license, not this repo. But same root cause: tsc's auto-inferred `rootDir` from `include` glob. We don't use tsc to emit here (Next.js does the bundling), so this doesn't apply.

- **`tsconfig.tsbuildinfo` getting tracked by git.** TS incremental build cache file. Add `*.tsbuildinfo` to `.gitignore` (already done at PB5+1) and `git rm --cached client-website/tsconfig.tsbuildinfo` if it ever gets staged.

- **The "bind-mounted into enghub-nginx-1" claim is now real (since 2026-05-13), but wasn't for the first days of prod.** Before 5/13, `/data/whatsub-web` and `whatsub.conf` were only injected into the nginx container via manual `docker cp` — gone the first time enghub recreated the container (which happened the morning of 5/13, taking the landing page down). Fixed by adding two bind mounts to **enghub's** docker-compose (NOT this repo's compose — enghub owns the nginx container's lifecycle). Backup of the pre-fix enghub compose is at `/opt/enghub/docker-compose.yml.bak-pre-whatsub-mount`. **Lesson:** if a cross-project service depends on bind mounts, those mounts MUST live in the compose of the project that owns the container, not in our docs as wishful thinking.

- **Atomic mv-rename breaks docker bind mounts.** Don't use `mv old new; mv new.tmp new` for the `/data/whatsub-web` deploy. Use in-place extract instead. (See deploy section.)

- **Hero animation not firing on second navigation.** `useReveal` uses `IntersectionObserver` with `unobserve` after first intersection. If the user scrolls the Hero out and back in, it stays visible (the `.visible` class persists). Intentional — re-firing the fade-in on every scroll-in is gimmicky.

- **Mobile layout: subtitle preview window stacks below text instead of side-by-side.** Intentional. We use `grid-cols-1` everywhere except a few places where `lg:grid-cols-2` kicks in at 1024px+. Side-by-side on phones makes the preview window unreadably small.

- **Section titles wrap onto 3 lines on narrow viewports.** Each title's font size uses `clamp(40px, 6vw, 72px)` — at 360px width it lands around 40px which is still big. Some Chinese titles wrap to 2-3 lines. Acceptable; alternatives (smaller min size, ellipsis, char-by-char animation) all looked worse.

- **Diagonal beam line clip-path math has TWO consumers.** `lineCoords(progress)` in DemoDiagonal returns `{leftY, rightY}` (in 0–100 percentages) at the current wipe progress. Both `clipPathFor()` (which builds the polygon for the demo layer's clip-path) AND the `<BeamLine>` component (which positions the glowing line sprite) call into it. Don't change one without the other or the visible white beam will drift away from the actual wipe boundary.

- **DemoDiagonal computes screen-space coords from `window.innerWidth/innerHeight`.** This is updated in the same scroll-RAF callback that updates `progress[]`. If you add a new responsive feature inside DemoDiagonal that needs the container dimensions, read from the existing `vp` state — don't add another resize listener.

- **`pnpm install` slow without taobao mirror.** `.npmrc` in this directory pins `registry=https://registry.npmmirror.com`. Don't delete it — the international npmjs registry is unreliable from mainland.

- **`useSearchParams()` in `/payment/success` MUST be inside a `<Suspense>` boundary** for `output: 'export'` to build. The page wraps `SuccessInner` (which calls `useSearchParams()`) in `<Suspense>`. Don't refactor it out without testing `pnpm build`.

- **The poll page hard-stops at 60 seconds.** After timeout it shows a "联系客服" branch with the order ref — buyers who pay successfully but don't get a synchronous mint can still recover via email (delivered async by the backend) or admin support.

- **Static export emits `out/payment/success.html` (no trailing slash), NOT `out/payment/success/index.html`.** This is Next 14's default with `trailingSlash: false`. nginx serves `https://whatsub.eversay.cc/payment/success` from `success.html` via try_files — no nginx config change needed. If you ever switch the project to `trailingSlash: true`, every route changes to `<route>/index.html` and nginx will handle it the same way.

## Quick map

| Task | File |
|------|------|
| Tweak Hero copy / tagline / 24h-trial badge | `src/components/HeroSlim.tsx` — tagline is line 29ish, badge is line 55ish (`下载即享 24 小时免费试用 · 满意再付款`) with a Clock icon. To swap the trust signal entirely (e.g. seasonal promo), replace the trailing `<p className="reveal reveal-delay-3 ...">` block — keep it ≤1 line of text |
| Add or change a demo slot in the diagonal gallery | `src/components/DemoDiagonal.tsx` — edit `DEMOS` array (caption + future image src). Total scroll height auto-grows as N grows |
| Replace a demo placeholder with a real GIF/video | `src/components/DemoDiagonal.tsx` — swap the `<DemoSlot>` body. Mechanic (clip-path + beam) doesn't care about content |
| Tune the diagonal slope or beam glow | `src/components/DemoDiagonal.tsx` — `SLOPE_OFFSET` (degrees of slope) and the inline `boxShadow` on `<BeamLine>` |
| Add an FAQ row | `src/components/FAQ.tsx` — insert into `QUESTIONS` array. First row is the differentiation question (`视频包`) — keep it first; new rows append to the end |
| Edit differentiation messaging (Hero badge + Pricing card + FAQ Q1) | All three must stay coherent. See Decision #14. Don't soften the FAQ wording about 视频包 — the explicit naming is load-bearing |
| Adjust price (display + paid amount) | Full runbook: [`docs/ops/changing-price.md`](docs/ops/changing-price.md). TL;DR — display: `src/lib/constants.ts` `PRICING.amount`; backend amount: `/opt/whatsub/.env` `LICENSE_PRICE_CNY`. **Both must agree** — frontend price is just visual; backend is the source of truth Alipay charges. |
| Change "立即购买" copy / disable Alipay path | `src/components/Pricing.tsx` (buyout) or `src/components/ProSubscriptionCard.tsx` (sub). Both are mounted as `variant='compact'` cards inside `src/components/CombinedPricing.tsx` on home; the section-level title + intro paragraphs live there. Disable Alipay = replace the form's submit handler with an `<a href={LINKS.xhsStore}>` fallback |
| Tweak CombinedPricing intro paragraphs / "需要注意" disclaimers | `src/components/CombinedPricing.tsx` lines 71-124 — three `<p>` blocks, one per tier. Each post-label prose wraps in a `{'...'}` JS string literal (NOT raw JSX text) to avoid React inserting a space at every source-line break (which on Chinese leaves visible mid-sentence gaps like "与 成本"). Same trick on `src/app/mobile/page.tsx` intro paragraphs |
| Tweak success-page polling | `src/app/payment/success/page.tsx` — `POLL_INTERVAL_MS` (1500ms) and `POLL_TIMEOUT_MS` (60000ms) constants near the top |
| Update support contact link on timeout | `src/app/payment/success/page.tsx` — the `<a href="...小红书...">` inside the `'timeout'` branch (currently hard-coded; could later pull from `LINKS.supportXhs` in constants) |
| Change 小红书 store URL | `src/lib/constants.ts` — `LINKS.xhsStore` |
| Change iOS / Edge / Chrome store URL | `src/lib/constants.ts` — `LINKS.iosAppStore` / `edgeAddonStore` / `chromeAddonStore`. These power the homepage "现已支持" 3-card grid (`Download.tsx` `NOW_AVAILABLE` array), the /plugin Hero buttons, /plugin nav Edge button, /mobile Hero + nav + Final CTA buttons. One constants edit propagates everywhere |
| Add a card to the "现已支持" grid | `src/components/Download.tsx` — append to `NOW_AVAILABLE` array (label + sub + Icon + href). Grid auto-stays 3-col on sm+, 1-col on mobile. If you need ≥4 cards, bump `sm:grid-cols-3` |
| Restore plugin fallback download (.zip) | `src/lib/constants.ts` — `LINKS.jihulabPluginPackages` and `LINKS.githubPluginReleases` still defined as last-ditch browse pages. The `/download/plugin` route still lives in the license backend (`whatsub-license/src/routes/download.ts` — JihuLab Package Registry → GitHub Releases API fallback chain), but the website stopped surfacing it 2026-06-10 once both stores went live |
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
- ~~Direct payment~~ Alipay PC web payment is integrated; see Pricing.tsx + payment-api.ts + /payment/success. Stripe and Wechat Pay still NOT integrated.
- CMS-driven content (everything is hard-coded — change the .tsx files)
