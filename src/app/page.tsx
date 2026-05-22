import { Nav } from '@/components/Nav';
import { HeroSlim } from '@/components/HeroSlim';
import { DemoDiagonal } from '@/components/DemoDiagonal';
import { Download } from '@/components/Download';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { ComingSoon } from '@/components/ComingSoon';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <HeroSlim />
        <DemoDiagonal />
        <Download />
        <Pricing />
        <FAQ />
        <ComingSoon />
      </main>
      <Footer />
    </>
  );
}
