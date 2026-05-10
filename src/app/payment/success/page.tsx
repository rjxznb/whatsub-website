'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPaymentStatus, type PaymentStatus } from '@/lib/payment-api';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60_000;

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageShell><Spinner /><p>加载中...</p></PageShell>}>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const searchParams = useSearchParams();
  const outTradeNo = searchParams.get('out_trade_no');

  type UIState = PaymentStatus | { status: 'loading' } | { status: 'timeout' };
  const [state, setState] = useState<UIState>({ status: 'loading' });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!outTradeNo) {
      setState({ status: 'cancelled' });
      return;
    }

    const tick = async () => {
      try {
        const next = await getPaymentStatus(outTradeNo);
        if (next.status === 'paid' || next.status === 'expired' || next.status === 'cancelled') {
          setState(next);
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return;
        }
        if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
          setState({ status: 'timeout' });
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return;
        }
      } catch {
        // transient — keep polling, the next tick may succeed.
      }
    };

    void tick();
    intervalRef.current = setInterval(() => void tick(), POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [outTradeNo]);

  if (!outTradeNo) {
    return (
      <PageShell>
        <h1 className="mb-4 text-3xl font-bold text-ink">未找到订单</h1>
        <p className="text-[--ink-soft]">未携带订单号。请从首页重新发起购买。</p>
        <Link href="/#pricing" className="mt-6 inline-block text-accent hover:underline">
          返回购买页 →
        </Link>
      </PageShell>
    );
  }

  if (state.status === 'loading') {
    return (
      <PageShell>
        <Spinner />
        <h1 className="mb-2 text-3xl font-bold text-ink">正在确认付款...</h1>
        <p className="font-mono text-xs text-[--ink-faint]">订单号 {outTradeNo}</p>
      </PageShell>
    );
  }

  if (state.status === 'paid') {
    return (
      <PageShell>
        <h1 className="mb-2 text-3xl font-bold text-ink">购买成功</h1>
        <p className="mb-8 text-[--ink-soft]">这是你的激活码（已同步发送至邮箱）：</p>
        <LicenseKeyDisplay licenseKey={state.licenseKey} />
        <ActivationGuide />
        <Link
          href="/#download"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-7 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
        >
          下载 whatSub →
        </Link>
      </PageShell>
    );
  }

  if (state.status === 'timeout') {
    return (
      <PageShell>
        <h1 className="mb-4 text-3xl font-bold text-ink">正在确认付款</h1>
        <p className="mb-2 text-[--ink-soft]">
          支付宝有时会延迟通知，激活码可能稍后到达邮箱。
        </p>
        <p className="text-[--ink-soft]">
          如已完成支付且 5 分钟后仍未收到邮件，请{' '}
          <a
            href="https://www.xiaohongshu.com/user/profile/67f1f5dc000000000e0119bf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            私信小红书联系客服
          </a>
          ，附上订单号：
        </p>
        <p className="mt-4 font-mono text-sm text-[--ink-faint]">{outTradeNo}</p>
      </PageShell>
    );
  }

  // expired / cancelled
  return (
    <PageShell>
      <h1 className="mb-4 text-3xl font-bold text-ink">订单已取消</h1>
      <p className="text-[--ink-soft]">付款流程未完成。可以从首页重新购买。</p>
      <Link href="/#pricing" className="mt-6 inline-block text-accent hover:underline">
        重新购买 →
      </Link>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[560px] py-24 text-center">{children}</div>
    </main>
  );
}

function Spinner() {
  return (
    <div className="mx-auto mb-8 h-10 w-10 animate-spin rounded-full border-2 border-[--hairline-strong] border-t-accent" />
  );
}

function LicenseKeyDisplay({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mx-auto mb-8 max-w-[480px] rounded-xl border border-[--hairline-strong] bg-[--bg-elev] p-6">
      <p className="mb-3 break-all font-mono text-base font-bold tracking-wider text-ink sm:text-lg">
        {licenseKey}
      </p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(licenseKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // navigator.clipboard requires HTTPS + user-gesture; fall through silently.
            // The key is still visible on screen, user can manually select+copy.
          }
        }}
        className="rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-white/[0.08]"
      >
        {copied ? '已复制 ✓' : '复制激活码'}
      </button>
    </div>
  );
}

function ActivationGuide() {
  return (
    <ol className="mx-auto max-w-[420px] list-decimal space-y-2 text-left text-sm text-[--ink-soft]">
      <li>
        下载并安装 whatSub（<a className="text-accent hover:underline" href="/#download">点这里</a>）
      </li>
      <li>打开 whatSub，按提示输入上面的激活码</li>
      <li>一份激活码可在 3 台个人设备上同时使用</li>
    </ol>
  );
}
