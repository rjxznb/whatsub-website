import { Nav } from '@/components/Nav';
import { HeroSlim } from '@/components/HeroSlim';
import { DemoDiagonal } from '@/components/DemoDiagonal';
import { Download } from '@/components/Download';
import { Pricing } from '@/components/Pricing';
import { ProSubscriptionCard } from '@/components/ProSubscriptionCard';
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
        {/* Pro 订阅作为买断的高级替代/升级路径 — 2026-06-04 加入主页(原来只在
            /mobile)。同一邮箱可以两种都买:买断永久使用桌面 BYOK,订阅再叠加
            上 LLM 中转 + 50 视频 + 1000 语料 的 Pro 配额。 */}
        <ProSubscriptionCard />
        <FAQ />
        <ComingSoon />
      </main>
      <Footer />
    </>
  );
}
