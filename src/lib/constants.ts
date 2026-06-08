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
    // 2026-06-08 — 买断 → Pro 订阅会自动 8 折(网站支付宝渠道,
    // 用买断邮箱下单即生效)。给重度用户一个继续解锁 AI 配额的
    // 优惠路径,同时把这条"权益"放在 feature 列表中段而不是
    // 末尾,避免被读成 upsell——读者把它感知为"买断附赠的好处"。
    '日后升级 Pro 订阅自动 8 折（买断用户专属）',
    '使用中遇到问题，客服协助解决',
    '所有未来更新免费',
  ],
} as const;

/**
 * Shared feature-row shape used by both SUBSCRIPTION and FREE_TIER.
 * `title` is the one-line headline (rendered with the ✓ icon + bold);
 * `desc` is an optional plain-language explanation rendered as a smaller
 * muted line directly below — used to demystify jargon ("云端视频"、
 * "500MB"、"语料库") for first-time visitors who haven't used the app.
 * The `desc` field was added 2026-06-08 after user feedback that bare
 * quota numbers weren't self-explanatory.
 */
export interface TierFeature {
  title: string;
  desc?: string;
}

/**
 * whatSub Pro subscription tier. Recurring revenue covers the recurring
 * costs (OSS storage + CDN egress + iOS sub-server entitlement check +
 * **代付 LLM token bill**) that a one-time license can't fund.
 * Same backend payment endpoint as PRICING; differentiated by
 * `product: 'sub_month' | 'sub_year'` on the create-order request.
 * Year price ≈ monthly × 12 × 0.64 — month 22 × 12 = 264 → 168 (≈ 36% off).
 *
 * Price change 2026-06-04: ¥12/¥88 → ¥22/¥168 to fund the managed-LLM
 * relay (spec: `Get_Video/docs/superpowers/specs/2026-06-03-whatsub-managed-llm-relay.md`).
 * No existing subscribers — app was still TestFlight-only at the change.
 *
 * 2026-06-08 — features refactored to `{title, desc?}` per user request to
 * explain what each quota term means (云端视频 / 单视频 500MB / 语料库 …
 * weren't self-evident to first-time visitors). The "(免费 X)" parenthetical
 * counterparts were moved out to FREE_TIER below, presented as a separate
 * ¥0 card so the free entitlements don't look like footnotes on the Pro
 * card.
 */
export const SUBSCRIPTION = {
  monthlyAmount: '¥22',
  yearlyAmount: '¥168',
  yearlySavingsLabel: '比月付省 ¥96 (约 36% off)',
  label: 'whatSub Pro · 解锁更多容量',
  features: [
    {
      title: '内置 AI · 零配置开箱即用',
      desc: '不用自己注册大模型账号、不用充值',
    },
    {
      title: 'AI 解析视频 · 月度 ≈ 130 次',
      desc: '一次"解析" = 整段字幕翻译成中文 + AI 自动标黄重点词 + 提取要点摘要',
    },
    {
      title: '云端视频 · 50 个',
      desc: '你导入的视频(含双语字幕和 AI 分析结果)存在云端,iOS / 桌面 / 浏览器插件之间无缝同步,换设备秒续',
    },
    {
      title: '单视频 500MB / 60 分钟',
      desc: '覆盖大多数 1 小时纪录片、TED 长讲、在线课程',
    },
    {
      title: '个人语料库 · 1000 条',
      desc: '长按字幕收藏的英文短语 + 中文解释 + 出处自动汇成你的私人复习库,卡片测验和 AI 口语陪练都从这里抽题',
    },
    {
      title: 'iOS / 桌面 / 浏览器插件 · 全平台共用',
      desc: '一份订阅,同邮箱登录三端通用',
    },
    {
      title: '随时在支付宝订单中关闭',
      desc: '到期自然结束,不自动续费',
    },
    {
      title: '使用中遇到问题，客服协助解决',
    },
  ] as readonly TierFeature[],
} as const;

/**
 * 0 元免费档 — 安装后的默认体验,所有人都能用。2026-06-08 拆出来单独
 * 一张卡片,把过去藏在 SUBSCRIPTION.features 里"(免费 X)"括号注释里的
 * 数字搬出来正面展示。意图:新用户能直接看清"我不付费能拿到什么",
 * 而不是先读 Pro 卡片再推算"那免费档是不是只够 1/16"。
 */
export const FREE_TIER = {
  amount: '¥0',
  label: '安装即开即用,不订阅',
  features: [
    {
      title: '全部核心功能 · 即装即用',
      desc: '双语字幕、AI 标黄、跟读、卡片测验、AI 口语陪练,免费档全都能用',
    },
    {
      title: 'AI 体验额度 · 一次性 200K token',
      desc: '约 4-5 个视频的 AI 解析量,体验后再决定要不要长期开 Pro',
    },
    {
      title: '云端视频 · 3 个',
      desc: '先试 3 个看是不是你要的工具,够试不够攒',
    },
    {
      title: '单视频 100MB / 20 分钟',
      desc: '一段 TED 短讲、vlog 或公开课片段完全够用',
    },
    {
      title: '个人语料库 · 50 条',
      desc: '熟悉一下收藏 → 复习的节奏,看是否符合你的学习习惯',
    },
    {
      title: 'iOS / 桌面 / 浏览器插件 · 全平台共用',
      desc: '同邮箱登录即可,免费档也同步',
    },
  ] as readonly TierFeature[],
} as const;
