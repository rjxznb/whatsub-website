/**
 * Brand tokens + external link constants. Importable from any component.
 * Brand source of truth: client/src/components/WelcomeIntro.tsx (the
 * desktop app's intro animation).
 */
export const BRAND = {
  bg: '#000000',
  bgSoft: '#0a0a0c',
  bgElev: '#141418',
  hairline: 'rgba(255,255,255,0.08)',
  hairlineStrong: 'rgba(255,255,255,0.14)',
  ink: '#ffffff',
  inkSoft: 'rgba(255,255,255,0.72)',
  inkMuted: 'rgba(255,255,255,0.48)',
  inkFaint: 'rgba(255,255,255,0.30)',
  accent: '#3B9BFF',
  accentGlow: 'rgba(59, 155, 255, 0.35)',
  amber: '#FCD34D',
} as const;

/**
 * External links. User can edit these values without rebuilding any
 * component logic — just update here, run pnpm build, redeploy.
 */
export const LINKS = {
  // 小红书 store URL — user fills in real product page URL.
  // Until then, points at the user's profile.
  xhsStore: 'https://www.xiaohongshu.com/user/profile/5f39412c0000000001002d67',

  // Backup downloads when /download/{win,mac} is unreachable.
  githubReleases: 'https://github.com/rjxznb/whatsub-releases/releases',
  jihulabReleases: 'https://jihulab.com/rjxznb-group/whatsub-release/-/releases',

  // Companion browser extension — primary download path is the Edge
  // Add-ons Store (official, one-click install for Edge users). Chrome
  // is not yet listed; Chrome users fall back to /download/plugin on
  // the license backend (which 302s to a .zip via JihuLab Package
  // Registry → GitHub) and load it unpacked via chrome://extensions
  // developer mode. The two browse-page links below are last-ditch
  // fallbacks for when both the redirect chain AND the underlying APIs
  // are unreachable — they land the user on a page where they can pick
  // a .zip by hand.
  edgeAddonStore:
    'https://microsoftedge.microsoft.com/addons/detail/nnimcmjcjapacadannjbfdhkpklnbekj',
  jihulabPluginPackages: 'https://jihulab.com/rjxznb/whatsub-plugin/-/packages',
  githubPluginReleases: 'https://github.com/rjxznb/whatsub-plugin/releases/latest',

  // Customer support — same xhs profile for now.
  supportXhs: 'https://www.xiaohongshu.com/user/profile/5f39412c0000000001002d67',

  // ICP filing.
  icpRecord: '京ICP备2026014893号-1',
  icpUrl: 'https://beian.miit.gov.cn',
} as const;

/**
 * Pricing — single tier. User edits here for now (¥XX placeholder).
 * Eventually move to a CMS or env if the price gets dynamic.
 */
export const PRICING = {
  amount: '¥59.9',
  originalAmount: '¥99.9' as string | null,  // struck-through original price shown next to amount
  period: null as string | null,
  label: '永久授权',
  features: [
    '永久使用，不订阅',
    '一份授权码可在 3 台设备同时激活',
    '永久免费查看公共语料库（持续更新）',
    '浏览器插件、移动端同步收藏，自动构建私人语料库',
    '换设备联系客服免费释放槽位',
    '使用中遇到问题，客服协助解决',
    '所有未来更新免费',
  ],
} as const;

/**
 * whatSub Pro subscription tier. Recurring revenue covers the recurring
 * costs (OSS storage + CDN egress + iOS sub-server entitlement check +
 * **代付 DeepSeek LLM token bill**) that a one-time license can't fund.
 * Same backend payment endpoint as PRICING; differentiated by
 * `product: 'sub_month' | 'sub_year'` on the create-order request.
 * Year price ≈ monthly × 12 × 0.64 — month 22 × 12 = 264 → 168 (≈ 36% off).
 *
 * Price change 2026-06-04: ¥12/¥88 → ¥22/¥168 to fund the managed-LLM
 * relay (spec: `Get_Video/docs/superpowers/specs/2026-06-03-whatsub-managed-llm-relay.md`).
 * No existing subscribers — app was still TestFlight-only at the change.
 */
export const SUBSCRIPTION = {
  monthlyAmount: '¥22',
  yearlyAmount: '¥168',
  yearlySavingsLabel: '比月付省 ¥96 (约 36% off)',
  label: 'whatSub Pro · 解锁更多容量',
  features: [
    '🆕 内置 LLM（DeepSeek）零配置开箱即用，不用自己申请 key',
    '云端视频 50 个（免费 3 个）',
    '单个视频 500MB / 60 分钟（免费 100MB / 20 分钟）',
    '个人语料库 1000 条（免费 50 条）',
    'iOS / 桌面 / 浏览器插件 全平台通用',
    '随时可在支付宝订单中关闭，到期自然结束',
    '使用中遇到问题，客服协助解决',
  ],
} as const;
