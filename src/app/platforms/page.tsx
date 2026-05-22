import { PlatformsOverview } from '@/components/PlatformsOverview';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'whatSub 平台与集成 · 桌面 / 插件 / 网页 / 移动',
  description:
    'whatSub 在桌面客户端、浏览器插件、网页端共享同一个云端语料库,多端同步复习。挑一个最贴合你习惯的入口开始。',
};

export default function PlatformsPage() {
  return (
    <>
      <main>
        <PlatformsOverview />
      </main>
      <Footer />
    </>
  );
}
