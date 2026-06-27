import { MobileShowcase } from '@/components/MobileShowcase';
import { HeroMobileBenefitLed } from '@/components/HeroMobileBenefitLed';
import { FreeTierCard } from '@/components/FreeTierCard';
import { ProSubscriptionCard } from '@/components/ProSubscriptionCard';
import { BrandSignOff } from '@/components/BrandSignOff';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'whatSub 移动端 · 随身看双语字幕 + 复习语料库',
  description:
    'whatSub iOS app：桌面端解析的视频和语料库随身看，国内免 VPN 秒开；双语字幕跟读、AI 标黄、语料库随身复习。现已上线 App Store。',
};

/**
 * /mobile pricing block — Free vs Pro 并排对比。
 *
 * 2026-06-08 — 注意: 这个 page.tsx 是 server component,所以不能用
 * `.reveal` CSS 类(它依赖 useReveal IntersectionObserver,observer 只在
 * client component 里能挂)。早期版本把 `.reveal` 写在了 section / h2 /
 * grid 上,结果整个定价区域 stays opacity-0,用户看到一片空白。
 * 现在统一不带 reveal——静态页面首屏直接渲染,没必要 fade-in。
 */
export default function MobilePage() {
  return (
    <>
      <main>
        {/* 2026-06-27: MobileShowcase now renders HeroMobileBenefitLed
            (pain-question + 一键解析 / 跨端同步 framing + App Store
            free download badge). Caveat signature moves to bottom via
            BrandSignOff, same as /. */}
        <MobileShowcase Hero={HeroMobileBenefitLed} />

        <section
          id="pricing"
          className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <h2
              className="mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
              style={{ fontSize: 'clamp(30px, 6.5vw, 64px)' }}
            >
              <span className="text-emerald-400">免费</span> 或{' '}
              <span className="text-[--ink-faint]">订阅</span>{' '}
              <span className="text-accent">Pro</span>，任选其一
            </h2>

            {/* Intro paragraph — parallel structure mirroring CombinedPricing
                on the home page. Each option opens with its price + headline
                benefit, then explains who it's for. 8 折 perk lives in the Pro
                paragraph since it's an upgrade incentive on the Pro purchase
                path. */}
            <div className="mb-12 max-w-[820px] space-y-4 text-base leading-relaxed text-[--ink-soft]">
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
                {/* 「需要注意」 — 跟首页 CombinedPricing 同款诚实陈述:
                    不是"app 不能用了",而是"Pro 容量回到免费档"。用户
                    停付后核心功能仍可用,容量收窄。2026-06-08。 */}
                {' '}
                <span className="text-[--ink-muted]">
                  <strong className="font-semibold text-[--ink-soft]">需要注意：</strong>
                  按月/年持续付费;订阅停止后 Pro 容量会回落到免费档(云端视频 50 → 3、语料库 1000 → 50、AI 也不再内置),核心功能仍可用但额度收窄。
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
              <FreeTierCard variant="compact" />
              <ProSubscriptionCard variant="compact" />
            </div>
          </div>
        </section>

        <BrandSignOff />
      </main>
      <Footer />
    </>
  );
}
