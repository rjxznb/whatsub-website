import { Nav } from '@/components/Nav';
import { HeroBenefitLedV2A } from '@/components/HeroBenefitLedV2A';
import { DemoDiagonal } from '@/components/DemoDiagonal';
import { Download } from '@/components/Download';
import { CombinedPricing } from '@/components/CombinedPricing';
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
            (7 real desktop-client screenshots) leads the value pitch;
            the brand wordmark moves to BrandSignOff at the bottom so it
            still gets seen but doesn't dominate the first impression. */}
        <HeroBenefitLedV2A />
        <DemoDiagonal />
        <Download />
        {/* 2026-06-04: collapsed the separate <Pricing /> + <ProSubscriptionCard />
            sections into one CombinedPricing module so visitors see both
            purchase options at one glance instead of scrolling through two
            near-identical "pricing" sections. Each card keeps its own state
            (promo for buyout, plan toggle for sub). */}
        <CombinedPricing />
        <FAQ />
        <BrandSignOff />
      </main>
      <Footer />
    </>
  );
}
