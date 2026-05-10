const API_BASE = '/api/license';

export interface CreateOrderResponse {
  outTradeNo: string;
  payUrl: string;
}

export interface PaymentStatusPending {
  status: 'pending';
}
export interface PaymentStatusPaid {
  status: 'paid';
  licenseKey: string;
}
export interface PaymentStatusOther {
  status: 'expired' | 'cancelled';
}
export type PaymentStatus = PaymentStatusPending | PaymentStatusPaid | PaymentStatusOther;

export async function createOrder(email: string): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_BASE}/payment/create-order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    let msg = 'request_failed';
    try {
      const body = (await res.json()) as { error?: string };
      msg = body.error ?? msg;
    } catch {
      // ignore JSON parse errors; default msg already set
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function getPaymentStatus(outTradeNo: string): Promise<PaymentStatus> {
  const res = await fetch(`${API_BASE}/payment/status/${encodeURIComponent(outTradeNo)}`);
  if (res.status === 404) {
    // Backend returns 404 if the order doesn't exist (e.g., user landed
    // on the success page with a tampered out_trade_no). Treat it as
    // cancelled in the UI so the page shows the "重新购买" branch
    // instead of polling forever.
    return { status: 'cancelled' };
  }
  if (!res.ok) throw new Error('status_request_failed');
  return res.json();
}
