import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { LINKS } from '@/lib/constants';

export const metadata = {
  title: '隐私政策',
  description: 'whatSub 如何收集、使用、保护你的信息。',
};

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-bg px-6 pb-24 pt-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[820px]">
          <Link
            href="/"
            className="mb-10 inline-flex items-center text-sm text-[--ink-muted] transition-colors hover:text-ink"
          >
            ← 返回首页
          </Link>

          <h1 className="mb-3 font-bold leading-[1.05] tracking-[-0.01em] text-ink" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            隐私政策
          </h1>
          <p className="mb-12 font-mono text-xs text-[--ink-faint]">
            最后更新：2026-05-24
          </p>

          <div className="space-y-10 text-[15px] leading-[1.8] text-[--ink-soft]">
            <p>
              whatSub 包含一款桌面应用和一款 iOS 应用，专注于把 YouTube 等视频处理成英语学习材料。本页面说明我们（桌面端与 iOS 端）收集什么信息、怎么使用、不会做什么。
            </p>

            <Section title="一、我们收集的信息">
              <p>
                <strong className="text-ink">邮箱地址。</strong>
                桌面端在购买时填写；iOS 端用邮箱 + 一次性验证码（OTP）登录。用来识别你的账号、发送授权码和必要通知。
              </p>
              <p>
                <strong className="text-ink">iOS 内购记录。</strong>
                你在 iOS 应用内购买（一次性买断或订阅）时，付款由 <strong className="text-ink">Apple App Store</strong> 处理——我们看不到你的 Apple 账户或银行卡信息。我们仅从 Apple 收到一个交易凭证（originalTransactionId）+ 商品 ID + 到期时间，用来记录"这个邮箱账号已购买/已订阅"，以便在你的设备间同步解锁状态。
              </p>
              <p>
                <strong className="text-ink">云端学习数据（登录后）。</strong>
                登录后，你保存到云端的字幕库（library）与语料库条目（短语、释义、用法）会存储在我们的服务器，用来在你的设备间同步。这些是你主动保存的学习内容，不含视频或音频文件本身。iOS 端还会在本地记录免费试用的开始时间（按账号），用于判断 24 小时试用是否结束。
              </p>
              <p>
                <strong className="text-ink">支付订单号。</strong>
                支付宝交易号 + 付款金额 + 付款时间。支付环节由支付宝官方处理，我们看不到你的支付宝账户密码或银行卡信息。
              </p>
              <p>
                <strong className="text-ink">设备指纹。</strong>
                whatSub 桌面应用会基于硬件特征生成一个匿名哈希指纹，仅用于两件事：（1）校验"同一份授权码不超过 3 台设备"；（2）记录 24 小时免费试用的开始时间，防止卸载重装绕过试用期。指纹不能反推到具体设备或个人。
              </p>
              <p>
                <strong className="text-ink">学生认证信息（可选）。</strong>
                如果你申请学生价，需要在小红书私信中提供学信网在线学籍报告的验证码。我们仅用它一次性核验你的学生身份，核验后不保存验证码本身。
              </p>
            </Section>

            <Section title="二、视频和音频如何处理">
              <p>
                <strong className="text-ink">视频和音频从不上传。</strong>{' '}
                这是 whatSub 设计上的核心原则：
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>YouTube 视频或本地视频，<strong className="text-ink">在你电脑上播放和处理</strong></li>
                <li>语音识别（Whisper 模型）<strong className="text-ink">在你电脑上完成</strong>，不发送任何音频数据到外部</li>
                <li>唯一会离开你电脑的是<strong className="text-ink">识别后的字幕文本</strong>——它会发送给你自己配置的大模型账号（如 ChatGPT、DeepSeek）翻译成中文</li>
                <li>我们的服务器<strong className="text-ink">不接触</strong>视频、音频，也不接触字幕文本</li>
              </ul>
            </Section>

            <Section title="三、我们不做的事">
              <ul className="list-disc space-y-2 pl-6">
                <li>不出售、不出租、不交换你的个人信息</li>
                <li>不分享给广告商、数据经纪商或其他任何第三方营销机构</li>
                <li>不要求你的真实姓名、家庭住址、电话号码</li>
                <li>桌面应用不在后台做任何数据回传——激活后断网也能正常使用</li>
                <li>不使用第三方追踪 cookie / 分析脚本</li>
              </ul>
            </Section>

            <Section title="四、第三方服务">
              <p>whatSub 的运转依赖以下几个第三方服务，它们各自对你的数据有自己的隐私政策：</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong className="text-ink">支付宝</strong>——处理桌面端付款。</li>
                <li><strong className="text-ink">Apple App Store / App 内购买</strong>——处理 iOS 端付款与订阅，并向我们提供交易凭证以同步解锁状态。</li>
                <li><strong className="text-ink">大模型服务商</strong>（OpenAI / DeepSeek / 智谱 / Claude / Kimi / Gemini / 通义 / SiliconFlow / 自部署 Ollama 等，由你自选）——翻译你的字幕文本。</li>
                <li><strong className="text-ink">QQ 邮箱（SMTP）</strong>——发送授权码邮件。</li>
                <li><strong className="text-ink">阿里云（北京）</strong>——我们的服务器托管商。</li>
              </ul>
            </Section>

            <Section title="五、数据保留期">
              <p>
                订单记录和邮箱地址会一直保留，因为它们是你授权码的归属凭证。如果你要求删除，我们会保留授权码本身（你已支付）+ 销毁邮箱关联——这意味着将来如果你换设备需要释放槽位，我们将无法识别你的身份。
              </p>
            </Section>

            <Section title="六、你的权利">
              <ul className="list-disc space-y-2 pl-6">
                <li><strong className="text-ink">查询</strong>——你可以联系我们查询我们记录的与你相关的全部数据</li>
                <li><strong className="text-ink">更正</strong>——比如改邮箱地址</li>
                <li><strong className="text-ink">删除</strong>——按上一节的方式申请</li>
              </ul>
              <p>
                联系方式：通过{' '}
                <a
                  href={LINKS.supportXhs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  小红书
                </a>{' '}
                私信我们。
              </p>
            </Section>

            <Section title="七、未成年人">
              <p>
                whatSub 面向自主学习英语的用户。如果你未满 18 岁，请在监护人指导下使用并购买。
              </p>
            </Section>

            <Section title="八、政策变更">
              <p>
                本政策可能根据法规或产品演进而更新。重大变更会在本页面置顶通知 30 天。继续使用即视为接受变更后的政策。
              </p>
            </Section>

            <Section title="九、联系">
              <p>
                ICP 备案：{LINKS.icpRecord}
                <br />
                客服：
                <a
                  href={LINKS.supportXhs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  小红书私信
                </a>
                （承诺 48 小时内回复）
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
