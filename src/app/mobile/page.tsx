import { MobileShowcase } from '@/components/MobileShowcase';
import { FreeTierCard } from '@/components/FreeTierCard';
import { ProSubscriptionCard } from '@/components/ProSubscriptionCard';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'whatSub 移动端 · 随身看双语字幕 + 复习语料库',
  description:
    'whatSub iOS app：桌面端解析的视频和语料库随身看，国内免 VPN 秒开；双语字幕跟读、AI 标黄、语料库随身复习。App Store 即将上线。',
};

/**
 * /mobile pricing block — Free vs Pro 并排对比。2026-06-08 重构(原来
 * 只有一张 standalone ProSubscriptionCard,新用户看不懂"云端视频"/
 * "500MB"/"语料库"是什么,Pro feature 后面"(免费 X)"括号注释也读得
 * 累)。
 *
 * 现在结构对齐首页 CombinedPricing:
 *   - 共享章节标题 + 引导段
 *   - lg 屏幕 grid-cols-2 并排,小屏自动堆叠
 *   - 两张卡片都是 compact 变体,几何对齐(同 padding / border / 圆角)
 * Pro feature 描述全部加了 desc 副文本(constants.ts SUBSCRIPTION.features),
 * Free 档独立一张卡片,把数字正面展示而不是塞 Pro 卡片的括号里。
 */
export default function MobilePage() {
  return (
    <>
      <main>
        <MobileShowcase />

        <section
          id="pricing"
          className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <h2
              className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
              style={{ fontSize: 'clamp(30px, 6.5vw, 64px)' }}
            >
              <span className="text-emerald-400">免费</span> 或{' '}
              <span className="text-[--ink-faint]">订阅</span>{' '}
              <span className="text-accent">Pro</span>，任选其一
            </h2>

            {/* Intro paragraph — parallel structure mirroring CombinedPricing
                on the home page, so a visitor moving between / and /mobile
                reads the same shape of pitch. Each option opens with its
                price + headline benefit, then explains who it's for.
                8 折 perk lives in the Pro paragraph since it's an upgrade
                incentive that applies to the Pro purchase path. */}
            <div className="reveal reveal-delay-1 mb-12 max-w-[820px] space-y-4 text-base leading-relaxed text-[--ink-soft]">
              <p>
                <strong className="font-semibold text-ink">免费 ¥0</strong>
                {' —— 安装即用,核心功能(双语字幕、AI 标黄、跟读、卡片测验、AI 口语陪练)完整开放。云端视频 3 个、个人语料库 50 条、一次性 200K token AI 体验额度——够你完整试 3-5 个视频判断是不是你要的工具。'}
              </p>
              <p>
                <strong className="font-semibold text-ink">订阅 Pro ¥22/月起</strong>
                {' —— 内置 AI 中转,免去配置环节,月度 ≈ 130 次 AI 解析。云端视频扩到 50 个、个人语料库 1000 条、单视频上限 500MB / 60 分钟;桌面 / 浏览器插件 / iOS 一份订阅三端共用。'}
                {' '}
                <span className="text-[--ink-soft]">
                  已持有桌面端 ¥59.9 永久授权的邮箱订阅自动享{' '}
                  <strong className="font-semibold text-ink">8 折</strong>。
                </span>
              </p>
            </div>

            <div className="reveal reveal-delay-2 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
              <FreeTierCard variant="compact" />
              <ProSubscriptionCard variant="compact" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
