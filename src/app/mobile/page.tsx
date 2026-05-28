import { MobileShowcase } from '@/components/MobileShowcase';
import { ProSubscriptionCard } from '@/components/ProSubscriptionCard';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'whatSub 移动端 · 随身看双语字幕 + 复习语料库',
  description:
    'whatSub iOS app：桌面端解析的视频和语料库随身看，国内免 VPN 秒开；双语字幕跟读、AI 标黄、语料库随身复习。App Store 即将上线。',
};

export default function MobilePage() {
  return (
    <>
      <main>
        <MobileShowcase />
        {/* Pro subscription card. Mounted on /mobile (not /pricing) because the
            value props are mostly mobile-side: cloud library quota, per-video
            size + duration cap, cross-device sync. Desktop in-app upsell
            dialogs deep-link to /mobile#pro. */}
        <ProSubscriptionCard />
      </main>
      <Footer />
    </>
  );
}
