import { Nav } from '@/components/Nav';
import { HeroBenefitLedV2A } from '@/components/HeroBenefitLedV2A';
import { DemoDiagonal } from '@/components/DemoDiagonal';
import { AudiencePersonas } from '@/components/AudiencePersonas';
import { Download } from '@/components/Download';
import { CombinedPricing } from '@/components/CombinedPricing';
import { TypicalScenarios } from '@/components/TypicalScenarios';
import { FAQ } from '@/components/FAQ';
import { BrandSignOff } from '@/components/BrandSignOff';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* 2026-06-27: HeroBenefitLedV2A replaced the old Caveat-signature
            HeroSlim. The pain-question framing + SubtitleMockup carousel
            (8 real desktop-client screenshots) leads the value pitch;
            the brand wordmark moves to BrandSignOff at the bottom so it
            still gets seen but doesn't dominate the first impression. */}
        <HeroBenefitLedV2A />
        <DemoDiagonal />
        {/* 2026-06-28: AudiencePersonas — 4 cards (刷剧党 / 内容创作者 /
            口语练习者 / 备考党) let visitors self-identify after seeing
            the functionality but before the buy ask. */}
        <AudiencePersonas />
        <Download />
        {/* 2026-06-04: collapsed the separate <Pricing /> + <ProSubscriptionCard />
            sections into one CombinedPricing module so visitors see both
            purchase options at one glance instead of scrolling through two
            near-identical "pricing" sections. Each card keeps its own state
            (promo for buyout, plan toggle for sub). */}
        <CombinedPricing />
        {/* 2026-06-28: TypicalScenarios — social-proof-by-scenario. 4 cards
            paired 1:1 with AudiencePersonas above, each describing how that
            persona typically uses whatSub. Honestly framed (no fake names,
            "典型场景" tag on each card) per the project's no-fake-testimonial
            policy. */}
        <TypicalScenarios />
        <FAQ />
        <BrandSignOff />
      </main>
      <Footer />
    </>
  );
}
