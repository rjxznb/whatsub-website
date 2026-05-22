import { PluginShowcase } from '@/components/PluginShowcase';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'whatSub 浏览器插件 · YouTube 双语字幕 + 划词收藏',
  description:
    'whatSub 浏览器插件：YouTube 整片双语字幕、AI 重点标黄、任意网页划词收藏，自动同步进多端私人语料库。Chrome / Edge 可用。',
};

export default function PluginPage() {
  return (
    <>
      <main>
        <PluginShowcase />
      </main>
      <Footer />
    </>
  );
}
