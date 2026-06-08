import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { LINKS } from '@/lib/constants';

export const metadata = {
  title: '条款与条件',
  description: 'whatSub 的授权范围、退款政策、责任限制等条款。',
};

export default function TermsPage() {
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

          <h1
            className="mb-3 font-bold leading-[1.05] tracking-[-0.01em] text-ink"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
          >
            条款与条件
          </h1>
          <p className="mb-12 font-mono text-xs text-[--ink-faint]">
            最后更新：2026-05-13
          </p>

          <div className="space-y-10 text-[15px] leading-[1.8] text-[--ink-soft]">
            <p>
              欢迎使用 whatSub。在购买和使用之前，请阅读以下条款。购买即视为你已阅读并接受本条款。
            </p>

            <Section title="一、你购买的是什么">
              <p>购买 whatSub 即获得：</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong className="text-ink">个人使用授权</strong>——仅供你本人学习使用，不可用于商业转售或集体共享</li>
                <li><strong className="text-ink">3 台个人设备</strong>同时激活的额度</li>
                <li><strong className="text-ink">终身使用权</strong>——一次购买永久使用，所有未来更新免费</li>
                <li>设备指纹槽位<strong className="text-ink">可释放</strong>——换电脑时联系客服免费释放旧槽位即可</li>
              </ul>
            </Section>

            <Section title="二、你不能做的事">
              <ul className="list-disc space-y-2 pl-6">
                <li>把你的授权码分享、转售、租借给他人</li>
                <li>反编译、逆向工程、修改或破解软件</li>
                <li>用 whatSub 处理盗版、非法获取或侵犯他人版权的视频</li>
                <li>把 whatSub 作为你自己商业服务的一部分对外提供</li>
                <li>规避 3 设备限制（如频繁更换硬件指纹）</li>
              </ul>
              <p>
                发现以上行为，我们有权吊销相关授权码，<strong className="text-ink">不退款</strong>，并按下一条追究违约责任。
              </p>
            </Section>

            <Section title="三、违约责任">
              <p>
                若你违反第二条任一规定，除即时吊销授权码、不予退款外，你还需向 whatSub 支付以下违约金：
              </p>
              <ul className="list-disc space-y-3 pl-6">
                <li>
                  <strong className="text-ink">分享或转借授权码</strong>——每多一台未授权设备激活，按
                  {' '}<strong className="text-ink">¥299 / 台</strong>（约官网零售价 5 倍）支付违约金。理由：你以单人价获得授权，扩散使用本质上是占用本不属于你的份额。
                </li>
                <li>
                  <strong className="text-ink">学生认证码被发现用于非学生身份</strong>——按上一项标准追究，并撤销该认证码对应的学生身份记录。
                </li>
                <li>
                  <strong className="text-ink">反编译、修改、破解软件或绕过授权校验</strong>——一次性违约金{' '}
                  <strong className="text-ink">¥5,000</strong>，并保留追究全部法律责任的权利。
                </li>
                <li>
                  <strong className="text-ink">转售授权码或将 whatSub 整合为他人付费服务</strong>——违约金为{' '}
                  <strong className="text-ink">实际获利的 10 倍 + ¥5,000</strong>，以较高者为准。
                </li>
                <li>
                  <strong className="text-ink">使用 whatSub 处理盗版 / 侵权视频</strong>——相关法律责任由你本人承担；如权利人向我们追溯，我们将配合提供你的购买与激活记录。
                </li>
              </ul>
              <p>
                已支付的购买费用<strong className="text-ink">不抵扣</strong>违约金。违约金不足以弥补 whatSub 实际损失的，我们保留追加索赔及通过法律途径追究的权利。
              </p>
            </Section>

            <Section title="四、退款政策">
              <p>
                数字商品售出后<strong className="text-ink">不支持退款</strong>。理由：
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>授权码一经发出即视为已交付，无法"收回"</li>
                <li>购买前可以用 24 小时免费试用验证所有核心功能</li>
                <li>这是国内数字商品交易的通用做法</li>
              </ul>
              <p>
                如果你遇到技术问题或激活困难，<strong className="text-ink">请优先联系</strong>
                <a
                  href={LINKS.supportXhs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  客服
                </a>
                ——我们承诺帮你解决，而不是简单一句"不退款"。
              </p>
            </Section>

            <Section title="五、价格档位">
              <ul className="list-disc space-y-2 pl-6">
                <li><strong className="text-ink">官网价 ¥59.9</strong>——直接通过 whatsub.eversay.cc 购买</li>
                <li><strong className="text-ink">粉丝早鸟价 ¥39.9</strong>——通过小红书专属链接进入，前 30 名买家，截止 2026-05-21</li>
                <li><strong className="text-ink">学生认证价 ¥29.9</strong>——通过学信网在线学籍报告核验后，获得一次性 STU-XXXXXX 认证码</li>
              </ul>
              <p>已享受学生价的授权码<strong className="text-ink">不可转让</strong>给非学生使用。</p>
            </Section>

            <Section title="六、关于翻译功能">
              <p>
                whatSub 的翻译功能依赖你自选的大模型服务商。你需要：
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>自己注册大模型账号并获取 API key</li>
                <li>承担大模型服务商按量收取的翻译费用</li>
                <li>遵守你所选服务商的使用条款</li>
              </ul>
              <p>
                翻译结果的准确性取决于大模型本身的能力，我们不对翻译质量做担保。
              </p>
            </Section>

            <Section title="七、服务可用性">
              <p>
                whatSub 桌面应用的<strong className="text-ink">核心功能完全离线运行</strong>。激活后不依赖我们的服务器。
              </p>
              <p>以下功能依赖网络：</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>首次激活授权码（一次性，约 200ms）</li>
                <li>更换设备时通过客服释放槽位</li>
                <li>检查并下载软件更新</li>
                <li>翻译字幕（依赖你自选的大模型服务商）</li>
              </ul>
              <p>
                即使我们将来停止运营，你已经激活的设备仍可继续离线使用；视频下载和字幕识别功能不会受影响。
              </p>
            </Section>

            <Section title="八、按现状提供">
              <p>
                whatSub 按 "as-is" 状态提供。我们尽力保证质量并持续迭代，但不对以下做绝对担保：
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>与所有视频格式 100% 兼容</li>
                <li>翻译结果 100% 准确（受大模型本身能力限制）</li>
                <li>与未来发布的所有操作系统版本完美兼容</li>
              </ul>
              <p>我们会持续修复 bug 和发布更新，但你接受软件可能存在缺陷。</p>
            </Section>

            <Section title="九、责任限制">
              <p>
                在法律允许的最大范围内，因使用本软件而产生的任何直接或间接损失，我们的赔偿责任上限为
                <strong className="text-ink">你购买本软件实际支付的金额</strong>。
              </p>
            </Section>

            <Section title="十、条款变更">
              <p>
                我们可能根据产品演进或法规变化不定期更新本条款。<strong className="text-ink">重大变更</strong>会在本页面置顶通知 30 天。继续使用即视为接受新条款。
              </p>
            </Section>

            <Section title="十一、适用法律">
              <p>本条款受中华人民共和国法律管辖。如有争议，双方应先友好协商；协商不成的，由我们运营主体所在地的法院管辖。</p>
            </Section>

            <Section title="十二、联系">
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
