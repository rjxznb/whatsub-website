'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: '这和那些卖「英语学习视频包」的有什么不同？',
    a: '本质完全不一样。视频包是把 YouTube 上别人的原创视频偷下来打包卖，本质是搬运 + 侵权 + 售卖盗版内容。whatSub 不一样：我们卖软件，处理的是你自己合法访问的 YouTube 视频。视频从 YouTube 加载、字幕识别在你电脑本机完成（视频和音频从不上传）、翻译走你自己的大模型账号。你拥有合法访问权的视频，我们提供更好的看视频和学习工具，不涉及任何版权问题。',
  },
  {
    q: '激活授权码后多久能用？',
    a: '立即可用，在线验证一次后软件完全离线运行，以后开机不再联网。一份授权码可在 3 台个人设备上同时使用，永久有效。',
  },
  {
    q: '3 台设备用满了怎么办？',
    a: '联系客服（小红书私信）免费释放任意一台旧设备的槽位，然后在新设备上重新激活即可，不限次数。',
  },
  {
    q: '可以先免费试用吗？',
    a: '可以，下载安装后会自动开始 24 小时免费试用，期间所有核心功能都能用。试用按设备指纹绑定，卸载重装、清缓存都不会重置时间（防滥用，望理解）。24 小时到期后可以继续看 demo 视频判断要不要购买，也可以私信客服咨询。',
  },
  {
    q: 'Windows 下载后浏览器提示「通常不会下载」怎么办？',
    a: 'Chrome/Edge 对不常见的 .exe 默认会弹这个提示，点「保留」就能保存下载好的安装文件。之后双击安装，过程中 Windows SmartScreen 可能再提示一次，点「更多信息」→「仍要运行」即可。',
  },
  {
    q: 'macOS 首次打开提示「无法验证开发者」怎么办？',
    a: '打开「系统设置」→「隐私与安全性」，拉到最下方找到 whatSub 那条，点「仍要打开」，以后再开不会再问。建议先把 .app 拖进「应用程序」文件夹再启动。',
  },
  {
    q: '为什么需要自己的大模型账号？',
    a: '这样对你最便宜。大模型本身是按调用量计费的服务，没法做"买断"——如果我们把它打包进 whatSub，就只能改成按月订阅，每个月固定收一笔，不管你那个月看不看视频。让你自己接大模型账号（类似 ChatGPT、DeepSeek 那种），实际翻译多少付多少，一片 22 分钟视频通常只花几分钱，比任何订阅都划算。内置 10 个预设（DeepSeek/OpenAI/Claude/Kimi/Gemini/智谱/Qwen/SiliconFlow/Ollama/自定义），切换零成本。',
  },
  {
    q: '视频会不会上传？',
    a: '不会，视频和音频都不会上传。把人声转成英文字幕这一步全部在你电脑上完成，只有翻译那一步会把识别出来的文字（不是视频或音频）发给大模型，拿回中文翻译。',
  },
  {
    q: '能不能退款？',
    a: '不支持退款，数字商品售出不退。购买前可以用 24 小时免费试用体验所有功能，满意再付款；有疑问也欢迎私信客服。',
  },
];

export function FAQ() {
  const ref = useReveal<HTMLElement>();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      id="faq"
      className="bg-bg px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[900px]">
        <h2
          className="reveal mb-14 font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 72px)' }}
        >
          常见问题
        </h2>
        <div className="reveal reveal-delay-1 border-t border-[--hairline]">
          {QUESTIONS.map((qa, i) => {
            const open = openIdx === i;
            return (
              <div key={i} className="border-b border-[--hairline]">
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:bg-white/[0.02]"
                  aria-expanded={open}
                >
                  <span className="text-base font-bold text-ink sm:text-lg lg:text-xl">
                    {qa.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[--ink-muted] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    strokeWidth={1.5}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-base leading-[1.7] text-[--ink-soft]">
                      {qa.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
