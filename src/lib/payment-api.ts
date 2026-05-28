const API_BASE = '/api/license';

export interface CreateOrderResponse {
  outTradeNo: string;
  payUrl: string;
}

export interface PaymentStatusPending {
  status: 'pending';
}
/** Backend always returns BOTH `licenseKey` and `product`:
 *  - Buyout order: `licenseKey` is the minted key, `product` is null.
 *  - Subscription order (sub_month / sub_year): `licenseKey` is null,
 *    `product` is the SKU. Frontend branches on `product` to render the
 *    right success UI. */
export interface PaymentStatusPaid {
  status: 'paid';
  licenseKey: string | null;
  product: 'sub_month' | 'sub_year' | null;
}
export interface PaymentStatusOther {
  status: 'expired' | 'cancelled';
}
export type PaymentStatus = PaymentStatusPending | PaymentStatusPaid | PaymentStatusOther;

export type SubProduct = 'sub_month' | 'sub_year';

/**
 * Validation result for a promo code (URL param OR buyer-entered).
 *
 * Two `kind`s of "active" reflect the two underlying tiers on the
 * backend:
 *   - 'promotion' = a campaign key (XHS_EARLY) with quota + deadline.
 *     Frontend renders the countdown/quota pill.
 *   - 'coupon' = a single-use code (STU-XXXXXX) tied to a parent
 *     promotion. Frontend renders a simpler "学生认证价 ¥X" badge.
 *
 * Invalid responses are union-tagged by reason so the UI can show the
 * right error copy ("已售罄" vs "码已使用" vs "码无效").
 */
export type PromoValidation =
  | {
      valid: true;
      kind: 'promotion';
      key: string;
      finalPrice: string;
      maxUses: number | null;
      usesCount: number;
      validUntil: number | null;
    }
  | {
      valid: true;
      kind: 'coupon';
      promotionKey: string;
      finalPrice: string;
    }
  | {
      valid: false;
      reason: 'not_found' | 'sold_out' | 'used' | 'expired' | 'network' | 'missing_code';
    };

export async function createOrder(
  email: string,
  promoCode?: string | null,
  product?: SubProduct,
): Promise<CreateOrderResponse> {
  // Buyout = no `product`, optionally a `promoCode`. Subscription = `product`
  // is sub_month/sub_year, no promoCode (backend ignores it for sub anyway —
  // sub SKUs use fixed prices from env, see whatsub-license payment.ts).
  const body: { email: string; promoCode?: string; product?: SubProduct } = { email };
  if (promoCode && !product) body.promoCode = promoCode;
  if (product) body.product = product;
  const res = await fetch(`${API_BASE}/payment/create-order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = 'request_failed';
    try {
      const data = (await res.json()) as { error?: string };
      msg = data.error ?? msg;
    } catch {
      // ignore JSON parse errors; default msg already set
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function validatePromo(code: string): Promise<PromoValidation> {
  try {
    const res = await fetch(
      `${API_BASE}/payment/validate-promo?code=${encodeURIComponent(code)}`,
    );
    if (!res.ok) return { valid: false, reason: 'network' };
    return res.json();
  } catch {
    return { valid: false, reason: 'network' };
  }
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
