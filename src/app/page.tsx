import { Nav } from '@/components/Nav';
import { HeroSlim } from '@/components/HeroSlim';
import { DemoDiagonal } from '@/components/DemoDiagonal';
import { Download } from '@/components/Download';
import { CombinedPricing } from '@/components/CombinedPricing';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <HeroSlim />
        <DemoDiagonal />
        <Download />
        {/* 2026-06-04: collapsed the separate <Pricing /> + <ProSubscriptionCard />
            sections into one CombinedPricing module so visitors see both
            purchase options at one glance instead of scrolling through two
            near-identical "pricing" sections. Each card keeps its own state
            (promo for buyout, plan toggle for sub). */}
        <CombinedPricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
