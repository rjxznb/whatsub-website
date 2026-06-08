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
 * whatSub Pro subscription tier. Recurring revenue covers the recurring
 * costs (OSS storage + CDN egress + iOS sub-server entitlement check +
 * **代付 LLM token bill**) that a one-time license can't fund.
 * Same backend payment endpoint as PRICING; differentiated by
 * `product: 'sub_month' | 'sub_year'` on the create-order request.
 *
 * 2026-06-08 — features rewritten as single self-explanatory sentences
 * (was bare nouns like "云端视频 50 个"). Each line now stands on its own
 * with the same big body-text size as the rest of the card; no
 * secondary small-text descriptions. Length kept under ~30 zh chars so
 * each bullet wraps at most once on the narrowest card width.
 *
 * The "(免费 X)" parentheticals that used to live here moved out to
 * FREE_TIER below — presented as a separate ¥0 card alongside this one,
 * so the free entitlements stop looking like footnotes on the Pro card.
 */
export const SUBSCRIPTION = {
  monthlyAmount: '¥22',
  yearlyAmount: '¥168',
  yearlySavingsLabel: '比月付省 ¥96 (约 36% off)',
  label: 'whatSub Pro · 解锁更多容量',
  // 2026-06-08 (round 2) — features 改用"动作 + 数量"句式: 用户反馈
  // "云端视频 50 个"这种命名性短语他们看不懂,要明确"可以上传 50 个
  // 视频到云端存储,桌面/手机/插件互通"——动词主导,quota 数字嵌在
  // 句子里,新用户不用先理解产品概念就能 picture 自己拿这个权益做
  // 什么。仍然单行大字,不加 desc 副文本。
  features: [
    '内置 AI 中转，零配置开箱即用，不用自己注册大模型账号',
    '每月可让 AI 解析约 130 次（自动翻译字幕 + 标黄重点 + 摘要要点）',
    '可上传 50 个视频到云端保存，桌面端解析的视频在 iOS / 插件无缝接着看',
    '单个视频最大可上传 500MB / 60 分钟（1 小时纪录片或长 TED 都装得下）',
    '可长按字幕收藏 1000 条短语到云端，卡片测验和 AI 口语陪练从这里抽题',
    'iOS / 桌面 / 浏览器插件三端共用一份订阅',
    '随时在支付宝订单中关闭，到期自然结束不续费',
    '使用中遇到问题，客服协助解决',
  ],
} as const;

/**
 * 0 元免费档 — 安装后的默认体验,所有人都能用。2026-06-08 拆出来单独
 * 一张卡片,把过去藏在 SUBSCRIPTION.features 里"(免费 X)"括号注释里的
 * 数字搬出来正面展示。意图:新用户能直接看清"我不付费能拿到什么",
 * 而不是先读 Pro 卡片再推算"那免费档是不是只够 1/16"。
 *
 * 同 SUBSCRIPTION.features,features 是一句话自解释的 string[],不再带
 * 小字 desc(2026-06-08 用户反馈"用大字给出,不要加小字,只不过精简
 * 一点,就一句话描述出来")。
 */
export const FREE_TIER = {
  amount: '¥0',
  label: '安装即开即用，不订阅、不付费',
  // 2026-06-08 (round 2) — 同 SUBSCRIPTION.features,改"动作 + 数量"句式。
  features: [
    '全部核心功能即装即用（双语字幕 / AI 标黄 / 跟读 / 卡片测验 / AI 口语陪练）',
    '一次性 200K token AI 体验额度，约够 AI 解析 4-5 个新视频',
    '可上传 3 个视频到云端保存，免费体验桌面 / 手机 / 插件三端同步',
    '单个视频最大可上传 100MB / 20 分钟（一段 TED 短讲或 vlog 够用）',
    '可长按字幕收藏 50 条短语到云端，体验卡片测验和 AI 口语陪练的节奏',
    'iOS / 桌面 / 浏览器插件三端共用，同邮箱登录即同步',
  ],
} as const;
