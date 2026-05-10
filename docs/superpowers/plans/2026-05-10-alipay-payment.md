# Alipay 电脑网站支付 v3 接入 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace whatSub's manual "小红书私信下单 + seller 手工 mint key" flow with fully-automated Alipay v3 PC web payment that mints a license + emails it on payment confirmation.

**Architecture:** Notify webhook + Query API fallback (Approach B from spec). Webhook mints + emails; success-page poll triggers a defensive Alipay query after a 5s grace, atomic CTE guards single-mint regardless of which path arrives first.

**Tech Stack:**
- Backend (whatsub-license): Hono 4 + node-postgres on Node 20, +`alipay-sdk@^4` +`nodemailer@^6`
- Frontend (whatsub-website): Next.js 14 App Router static export
- Email: QQ SMTP via nodemailer (mirrors Enghub `mail.service.ts` pattern)
- DB: existing Postgres 15 in `enghub-postgres-1`, DB `whatsub_license`

**Spec:** `docs/superpowers/specs/2026-05-10-alipay-payment-design.md`

**Cross-repo:** Tasks 1–7 in `whatsub-license` (clone at `/c/Users/renjx/Desktop/whatsub-license`). Tasks 8–12 in `whatsub-website` (current repo). Tasks 13–14 are server ops.

---

## Files Map

### whatsub-license (backend)

```
whatsub-license/
├── schema.sql                                  # Modify — append orders table
├── package.json                                # Modify — add alipay-sdk, nodemailer, @types/nodemailer
├── .env.example                                # Modify — add ALIPAY_*, SMTP_*, LICENSE_PRICE_CNY
├── CLAUDE.md                                   # Modify — Quick Map + new endpoints + lib modules
├── src/
│   ├── index.ts                                # Modify — register payment routes + cleanup setInterval
│   ├── lib/
│   │   ├── db.ts                               # Modify — add 5 orders methods incl. atomic mint CTE
│   │   ├── types.ts                            # Modify — add OrderRow type
│   │   ├── alipay.ts                           # Create — AlipayClient class wrapping alipay-sdk
│   │   └── mail.ts                             # Create — MailService class wrapping nodemailer
│   └── routes/
│       └── payment.ts                          # Create — 3 endpoints: create-order / status / notify
└── tests/
    ├── lib/
    │   ├── db.test.ts                          # Modify — add orders + atomic mint tests
    │   ├── alipay.test.ts                      # Create — mocked alipay-sdk tests
    │   └── mail.test.ts                        # Create — mocked nodemailer tests
    └── routes/
        └── payment.test.ts                     # Create — full route tests with mocks
```

### whatsub-website (frontend)

```
whatsub-website/
├── src/
│   ├── lib/
│   │   ├── constants.ts                        # Modify — keep PRICING.amount=¥29.9 (already done)
│   │   └── payment-api.ts                      # Create — fetch wrappers for create-order + status
│   ├── components/
│   │   └── Pricing.tsx                         # Modify — email form + 立即购买 + xhs fallback
│   └── app/
│       └── payment/
│           └── success/
│               └── page.tsx                    # Create — polling page with Suspense wrapper
├── CLAUDE.md                                   # Modify — Quick Map for payment flow
└── public/                                     # No changes
```

---

## Task 1: orders table schema + DB methods (whatsub-license)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-license/schema.sql` — append orders table
- Modify: `/c/Users/renjx/Desktop/whatsub-license/src/lib/types.ts` — add `OrderRow` type
- Modify: `/c/Users/renjx/Desktop/whatsub-license/src/lib/db.ts` — add 5 methods + atomic mint CTE
- Modify: `/c/Users/renjx/Desktop/whatsub-license/tests/lib/db.test.ts` — TDD all of the above

- [ ] **Step 1.1: Append orders DDL to schema.sql**

Append to `/c/Users/renjx/Desktop/whatsub-license/schema.sql`:

```sql

-- Orders for Alipay payment (added 2026-05-10).
-- One row per checkout attempt, transitions pending → paid (or expired/cancelled).
-- license_key is filled when notify or query confirms payment + mints a key.
CREATE TABLE IF NOT EXISTS orders (
    out_trade_no     TEXT     PRIMARY KEY,
    email            TEXT     NOT NULL,
    amount_cny       NUMERIC(10,2) NOT NULL,
    status           TEXT     NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','paid','expired','cancelled')),
    alipay_trade_no  TEXT,
    license_key      TEXT     REFERENCES licenses(key),
    created_at       BIGINT   NOT NULL,
    paid_at          BIGINT,
    notify_payload   JSONB
);

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_email          ON orders (email);
```

- [ ] **Step 1.2: Add OrderRow type**

Modify `/c/Users/renjx/Desktop/whatsub-license/src/lib/types.ts`, append:

```ts
export type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

export interface OrderRow {
  outTradeNo: string;
  email: string;
  amountCny: string;        // pg returns NUMERIC as string; do the parseFloat at boundary
  status: OrderStatus;
  alipayTradeNo: string | null;
  licenseKey: string | null;
  createdAt: number;
  paidAt: number | null;
  notifyPayload: Record<string, unknown> | null;
}

export interface MintLicenseResult {
  /** True if THIS call actually claimed the order + minted the key. False if another call already did. */
  claimed: boolean;
  /** The license key bound to this order (whether claimed by us or earlier). null if order does not exist. */
  licenseKey: string | null;
  /** Email of the buyer — needed by caller to trigger sendLicenseEmail when claimed=true. */
  email: string | null;
}
```

- [ ] **Step 1.3: Write failing test for `createOrder` + `getOrder`**

Add to `/c/Users/renjx/Desktop/whatsub-license/tests/lib/db.test.ts` (existing file):

```ts
describe('orders', () => {
  it('createOrder + getOrder roundtrips', async () => {
    const db = await freshDb();
    await db.createOrder({
      outTradeNo: 'ord_abc',
      email: 'buyer@example.com',
      amountCny: '29.9',
      createdAt: 1_700_000_000_000,
    });
    const row = await db.getOrder('ord_abc');
    expect(row).toMatchObject({
      outTradeNo: 'ord_abc',
      email: 'buyer@example.com',
      amountCny: '29.9',
      status: 'pending',
      alipayTradeNo: null,
      licenseKey: null,
      createdAt: 1_700_000_000_000,
      paidAt: null,
      notifyPayload: null,
    });
  });

  it('getOrder returns null for missing out_trade_no', async () => {
    const db = await freshDb();
    expect(await db.getOrder('nope')).toBeNull();
  });
});
```

(`freshDb()` is the existing helper that returns a pg-mem-backed Database instance; if it doesn't exist yet, look at the top of `tests/lib/db.test.ts` for the current setup pattern and reuse it.)

- [ ] **Step 1.4: Run failing test**

Run: `cd /c/Users/renjx/Desktop/whatsub-license && pnpm test -- db.test.ts`
Expected: tests fail with `db.createOrder is not a function`.

- [ ] **Step 1.5: Implement `createOrder` + `getOrder`**

Add to `Database` class in `/c/Users/renjx/Desktop/whatsub-license/src/lib/db.ts`:

```ts
async createOrder(input: {
  outTradeNo: string;
  email: string;
  amountCny: string;
  createdAt: number;
}): Promise<void> {
  await this.pool.query(
    `INSERT INTO orders (out_trade_no, email, amount_cny, created_at)
     VALUES ($1, $2, $3, $4)`,
    [input.outTradeNo, input.email, input.amountCny, input.createdAt],
  );
}

async getOrder(outTradeNo: string): Promise<OrderRow | null> {
  const { rows } = await this.pool.query(
    `SELECT out_trade_no, email, amount_cny, status, alipay_trade_no,
            license_key, created_at, paid_at, notify_payload
     FROM   orders WHERE out_trade_no = $1`,
    [outTradeNo],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    outTradeNo: r.out_trade_no,
    email: r.email,
    amountCny: String(r.amount_cny),
    status: r.status,
    alipayTradeNo: r.alipay_trade_no,
    licenseKey: r.license_key,
    createdAt: Number(r.created_at),
    paidAt: r.paid_at == null ? null : Number(r.paid_at),
    notifyPayload: r.notify_payload,
  };
}
```

Don't forget to import `OrderRow` from `./types.js` at the top of the file.

- [ ] **Step 1.6: Run tests pass**

Run: `cd /c/Users/renjx/Desktop/whatsub-license && pnpm test -- db.test.ts`
Expected: 2 new tests pass; existing tests still pass.

- [ ] **Step 1.7: Write failing test for atomic `markOrderPaidAndMintLicense`**

Add to `tests/lib/db.test.ts`:

```ts
it('markOrderPaidAndMintLicense first call claims, mints license, returns claimed=true', async () => {
  const db = await freshDb();
  await db.createOrder({
    outTradeNo: 'ord_xyz',
    email: 'buyer@x.com',
    amountCny: '29.9',
    createdAt: 1_700_000_000_000,
  });

  const result = await db.markOrderPaidAndMintLicense({
    outTradeNo: 'ord_xyz',
    alipayTradeNo: '202605101234',
    paidAt: 1_700_000_010_000,
    notifyPayload: { trade_status: 'TRADE_SUCCESS' },
    generatedKey: 'WHATSUB-AAAA-BBBB-CCCC-DDDD',
  });

  expect(result.claimed).toBe(true);
  expect(result.licenseKey).toBe('WHATSUB-AAAA-BBBB-CCCC-DDDD');
  expect(result.email).toBe('buyer@x.com');

  const order = await db.getOrder('ord_xyz');
  expect(order!.status).toBe('paid');
  expect(order!.licenseKey).toBe('WHATSUB-AAAA-BBBB-CCCC-DDDD');
  expect(order!.alipayTradeNo).toBe('202605101234');

  // licenses table got the new key
  const licenses = await db.listLicenses({ limit: 10, offset: 0 });
  expect(licenses.find((l) => l.key === 'WHATSUB-AAAA-BBBB-CCCC-DDDD')).toMatchObject({
    key: 'WHATSUB-AAAA-BBBB-CCCC-DDDD',
    email: 'buyer@x.com',
    maxDevices: 3,
  });
});

it('markOrderPaidAndMintLicense second call is idempotent: claimed=false, no double mint', async () => {
  const db = await freshDb();
  await db.createOrder({
    outTradeNo: 'ord_xyz',
    email: 'buyer@x.com',
    amountCny: '29.9',
    createdAt: 1_700_000_000_000,
  });

  const r1 = await db.markOrderPaidAndMintLicense({
    outTradeNo: 'ord_xyz',
    alipayTradeNo: '202605101234',
    paidAt: 1_700_000_010_000,
    notifyPayload: {},
    generatedKey: 'WHATSUB-AAAA-BBBB-CCCC-DDDD',
  });
  expect(r1.claimed).toBe(true);

  // Second call with a DIFFERENT generatedKey — must not mint a second license
  const r2 = await db.markOrderPaidAndMintLicense({
    outTradeNo: 'ord_xyz',
    alipayTradeNo: '202605101234',
    paidAt: 1_700_000_020_000,
    notifyPayload: {},
    generatedKey: 'WHATSUB-EEEE-FFFF-GGGG-HHHH',
  });
  expect(r2.claimed).toBe(false);
  expect(r2.licenseKey).toBe('WHATSUB-AAAA-BBBB-CCCC-DDDD'); // first key wins

  // Only one license row total
  const licenses = await db.listLicenses({ limit: 10, offset: 0 });
  expect(licenses.filter((l) => l.email === 'buyer@x.com').length).toBe(1);
});

it('markOrderPaidAndMintLicense on missing order returns claimed=false, licenseKey=null', async () => {
  const db = await freshDb();
  const result = await db.markOrderPaidAndMintLicense({
    outTradeNo: 'does_not_exist',
    alipayTradeNo: 'x',
    paidAt: 0,
    notifyPayload: {},
    generatedKey: 'WHATSUB-XXXX-XXXX-XXXX-XXXX',
  });
  expect(result.claimed).toBe(false);
  expect(result.licenseKey).toBeNull();
  expect(result.email).toBeNull();
});
```

- [ ] **Step 1.8: Run failing test**

Run: `pnpm test -- db.test.ts`
Expected: 3 new tests fail.

- [ ] **Step 1.9: Implement `markOrderPaidAndMintLicense`**

Add to `Database` class:

```ts
async markOrderPaidAndMintLicense(input: {
  outTradeNo: string;
  alipayTradeNo: string;
  paidAt: number;
  notifyPayload: Record<string, unknown>;
  generatedKey: string;
}): Promise<MintLicenseResult> {
  // Atomic CTE: only the call that flips status from pending → paid
  // gets to insert into licenses. Subsequent calls find the row already
  // 'paid' so the UPDATE matches 0 rows, the CTE is empty, and the
  // INSERT becomes a no-op. After the first claim, license_key is
  // already set on the order row; we re-read it to return for non-claim
  // callers.
  const client = await this.pool.connect();
  try {
    await client.query('BEGIN');

    const updateRes = await client.query(
      `UPDATE orders
       SET    status = 'paid',
              alipay_trade_no = $2,
              license_key = $3,
              paid_at = $4,
              notify_payload = $5
       WHERE  out_trade_no = $1 AND status = 'pending'
       RETURNING email, license_key`,
      [
        input.outTradeNo,
        input.alipayTradeNo,
        input.generatedKey,
        input.paidAt,
        JSON.stringify(input.notifyPayload),
      ],
    );

    if (updateRes.rowCount && updateRes.rowCount > 0) {
      // We claimed it. Insert the license row.
      const claimedEmail = updateRes.rows[0].email as string;
      await client.query(
        `INSERT INTO licenses (key, email, max_devices, created_at)
         VALUES ($1, $2, 3, $3)
         ON CONFLICT (key) DO NOTHING`,
        [input.generatedKey, claimedEmail, input.paidAt],
      );
      await client.query('COMMIT');
      return {
        claimed: true,
        licenseKey: input.generatedKey,
        email: claimedEmail,
      };
    }

    // We didn't claim — re-read existing order to return its key (if any)
    const existing = await client.query(
      `SELECT email, license_key FROM orders WHERE out_trade_no = $1`,
      [input.outTradeNo],
    );
    await client.query('COMMIT');

    if (existing.rows.length === 0) {
      return { claimed: false, licenseKey: null, email: null };
    }
    return {
      claimed: false,
      licenseKey: existing.rows[0].license_key,
      email: existing.rows[0].email,
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

Heads-up: the existing project uses class-based Database. Match that style. Don't forget `import type { MintLicenseResult } from './types.js';`.

**Note on pg-mem caveat (per whatsub-license CLAUDE.md):** pg-mem 3.x does NOT enforce FK constraints, but the integration of CTE + secondary INSERT does work. If the existing test helper for licenses has issues with the FK reference, just ensure the test asserts behavior at the application level (key in licenses, status in orders), not at the FK level.

- [ ] **Step 1.10: Run tests pass**

Run: `pnpm test -- db.test.ts`
Expected: all 3 idempotency tests pass.

- [ ] **Step 1.11: Write failing test for cleanup helpers**

Add to `tests/lib/db.test.ts`:

```ts
it('findExpiredPendingOrders returns only old pending orders', async () => {
  const db = await freshDb();
  await db.createOrder({ outTradeNo: 'old_pending',     email: 'a@a.com', amountCny: '29.9', createdAt: 1_000 });
  await db.createOrder({ outTradeNo: 'recent_pending',  email: 'b@b.com', amountCny: '29.9', createdAt: 9_000 });
  // Mark one as paid so it's not pending
  await db.markOrderPaidAndMintLicense({
    outTradeNo: 'old_pending',
    alipayTradeNo: 't1', paidAt: 5_000, notifyPayload: {},
    generatedKey: 'WHATSUB-1111-2222-3333-4444',
  });
  // Add a 3rd that is old AND pending
  await db.createOrder({ outTradeNo: 'really_old_pending', email: 'c@c.com', amountCny: '29.9', createdAt: 100 });

  const expired = await db.findExpiredPendingOrders({ olderThan: 5_000 });
  expect(expired.map((r) => r.outTradeNo).sort()).toEqual(['really_old_pending']);
});

it('expireOrders flips pending → expired in bulk', async () => {
  const db = await freshDb();
  await db.createOrder({ outTradeNo: 'a', email: 'a@a.com', amountCny: '29.9', createdAt: 1 });
  await db.createOrder({ outTradeNo: 'b', email: 'b@b.com', amountCny: '29.9', createdAt: 2 });
  await db.expireOrders(['a', 'b']);
  expect((await db.getOrder('a'))!.status).toBe('expired');
  expect((await db.getOrder('b'))!.status).toBe('expired');
});
```

- [ ] **Step 1.12: Implement cleanup methods**

Add to `Database`:

```ts
async findExpiredPendingOrders(input: { olderThan: number }): Promise<OrderRow[]> {
  const { rows } = await this.pool.query(
    `SELECT out_trade_no, email, amount_cny, status, alipay_trade_no, license_key,
            created_at, paid_at, notify_payload
     FROM   orders
     WHERE  status = 'pending' AND created_at < $1`,
    [input.olderThan],
  );
  return rows.map((r) => ({
    outTradeNo: r.out_trade_no,
    email: r.email,
    amountCny: String(r.amount_cny),
    status: r.status,
    alipayTradeNo: r.alipay_trade_no,
    licenseKey: r.license_key,
    createdAt: Number(r.created_at),
    paidAt: r.paid_at == null ? null : Number(r.paid_at),
    notifyPayload: r.notify_payload,
  }));
}

async expireOrders(outTradeNos: string[]): Promise<void> {
  if (outTradeNos.length === 0) return;
  await this.pool.query(
    `UPDATE orders SET status = 'expired'
     WHERE out_trade_no = ANY($1) AND status = 'pending'`,
    [outTradeNos],
  );
}
```

- [ ] **Step 1.13: Run tests pass**

Run: `pnpm test -- db.test.ts && pnpm typecheck`
Expected: all DB tests + typecheck clean.

- [ ] **Step 1.14: Commit**

```bash
cd /c/Users/renjx/Desktop/whatsub-license
git add schema.sql src/lib/types.ts src/lib/db.ts tests/lib/db.test.ts
git commit -m "$(cat <<'EOF'
feat(db): orders table + atomic markOrderPaidAndMintLicense CTE

Adds orders table for Alipay payment integration. The atomic mint CTE
guards single-mint regardless of which path arrives first (notify
webhook or status-endpoint query fallback).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: AlipayClient class wrapping alipay-sdk (whatsub-license)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-license/package.json` — add `alipay-sdk@^4`
- Create: `/c/Users/renjx/Desktop/whatsub-license/src/lib/alipay.ts`
- Create: `/c/Users/renjx/Desktop/whatsub-license/tests/lib/alipay.test.ts`

- [ ] **Step 2.1: Install alipay-sdk**

```bash
cd /c/Users/renjx/Desktop/whatsub-license
pnpm add alipay-sdk@^4
```

Verify in package.json: `"alipay-sdk": "^4.x.x"` shows up under dependencies.

- [ ] **Step 2.2: Write failing test for `createPagePay`**

Create `/c/Users/renjx/Desktop/whatsub-license/tests/lib/alipay.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock alipay-sdk before importing AlipayClient
const mockPageExec = vi.fn();
const mockExec = vi.fn();
const mockCheckNotifySignV2 = vi.fn();

vi.mock('alipay-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    pageExec: mockPageExec,
    exec: mockExec,
    checkNotifySignV2: mockCheckNotifySignV2,
  })),
}));

import { AlipayClient } from '../../src/lib/alipay.js';

const FAKE_CONFIG = {
  appId: 'fake_app',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\nFAKE\n-----END RSA PRIVATE KEY-----',
  alipayPublicKey: '-----BEGIN PUBLIC KEY-----\nFAKE\n-----END PUBLIC KEY-----',
  gateway: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
  notifyUrl: 'https://example.test/notify',
  returnUrl: 'https://example.test/return',
};

describe('AlipayClient.createPagePay', () => {
  beforeEach(() => {
    mockPageExec.mockReset();
    mockExec.mockReset();
    mockCheckNotifySignV2.mockReset();
  });

  it('builds a page-pay URL with correct biz fields + return URL containing out_trade_no', async () => {
    mockPageExec.mockResolvedValue('https://openapi.alipay.com/gateway.do?...&sign=fake');
    const client = new AlipayClient(FAKE_CONFIG);

    const url = await client.createPagePay({
      outTradeNo: 'ord_abc',
      totalAmount: '29.90',
      subject: 'whatSub 永久授权',
    });

    expect(url).toBe('https://openapi.alipay.com/gateway.do?...&sign=fake');
    expect(mockPageExec).toHaveBeenCalledWith(
      'alipay.trade.page.pay',
      expect.objectContaining({
        bizContent: expect.objectContaining({
          out_trade_no: 'ord_abc',
          total_amount: '29.90',
          subject: 'whatSub 永久授权',
          product_code: 'FAST_INSTANT_TRADE_PAY',
        }),
        notifyUrl: 'https://example.test/notify',
        returnUrl: 'https://example.test/return?out_trade_no=ord_abc',
      }),
    );
  });
});

describe('AlipayClient.verifyNotify', () => {
  beforeEach(() => {
    mockCheckNotifySignV2.mockReset();
  });

  it('returns true when SDK accepts the signature', () => {
    mockCheckNotifySignV2.mockReturnValue(true);
    const client = new AlipayClient(FAKE_CONFIG);
    expect(client.verifyNotify({ trade_status: 'TRADE_SUCCESS', sign: 'x' })).toBe(true);
    expect(mockCheckNotifySignV2).toHaveBeenCalledWith({ trade_status: 'TRADE_SUCCESS', sign: 'x' });
  });

  it('returns false when SDK rejects the signature', () => {
    mockCheckNotifySignV2.mockReturnValue(false);
    const client = new AlipayClient(FAKE_CONFIG);
    expect(client.verifyNotify({ trade_status: 'TRADE_SUCCESS', sign: 'bad' })).toBe(false);
  });

  it('returns false when SDK throws (defensive)', () => {
    mockCheckNotifySignV2.mockImplementation(() => { throw new Error('bad input'); });
    const client = new AlipayClient(FAKE_CONFIG);
    expect(client.verifyNotify({})).toBe(false);
  });
});

describe('AlipayClient.queryTrade', () => {
  beforeEach(() => {
    mockExec.mockReset();
  });

  it('returns TRADE_SUCCESS + alipayTradeNo on a paid trade', async () => {
    mockExec.mockResolvedValue({
      code: '10000',
      msg: 'Success',
      tradeStatus: 'TRADE_SUCCESS',
      tradeNo: '202605101234',
      outTradeNo: 'ord_abc',
    });
    const client = new AlipayClient(FAKE_CONFIG);
    const result = await client.queryTrade('ord_abc');
    expect(result).toEqual({ tradeStatus: 'TRADE_SUCCESS', alipayTradeNo: '202605101234' });
    expect(mockExec).toHaveBeenCalledWith(
      'alipay.trade.query',
      expect.objectContaining({ bizContent: { out_trade_no: 'ord_abc' } }),
    );
  });

  it('returns NOT_FOUND when trade does not exist (code 40004)', async () => {
    mockExec.mockResolvedValue({ code: '40004', msg: 'Business Failed', subCode: 'ACQ.TRADE_NOT_EXIST' });
    const client = new AlipayClient(FAKE_CONFIG);
    expect(await client.queryTrade('ord_xyz')).toEqual({ tradeStatus: 'NOT_FOUND', alipayTradeNo: null });
  });

  it('returns ERROR on network/SDK throws', async () => {
    mockExec.mockRejectedValue(new Error('ECONNREFUSED'));
    const client = new AlipayClient(FAKE_CONFIG);
    expect(await client.queryTrade('ord_abc')).toEqual({ tradeStatus: 'ERROR', alipayTradeNo: null });
  });
});
```

- [ ] **Step 2.3: Run failing test**

Run: `pnpm test -- alipay.test.ts`
Expected: fails with `Cannot find module '../../src/lib/alipay.js'`.

- [ ] **Step 2.4: Implement AlipayClient**

Create `/c/Users/renjx/Desktop/whatsub-license/src/lib/alipay.ts`:

```ts
import AlipaySdk from 'alipay-sdk';

export interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gateway: string;
  notifyUrl: string;
  returnUrl: string;
}

export type AlipayTradeStatus =
  | 'TRADE_SUCCESS'    // paid, order will be settled
  | 'TRADE_FINISHED'   // settled, refund window closed
  | 'WAIT_BUYER_PAY'   // buyer hasn't paid yet
  | 'TRADE_CLOSED'     // closed without payment OR fully refunded
  | 'NOT_FOUND'        // out_trade_no unknown to Alipay
  | 'ERROR';           // network/SDK failure (ours, not theirs)

export interface QueryResult {
  tradeStatus: AlipayTradeStatus;
  alipayTradeNo: string | null;
}

export class AlipayClient {
  private sdk: AlipaySdk;
  private config: AlipayConfig;

  constructor(config: AlipayConfig) {
    this.config = config;
    // alipay-sdk v4 exposes both V1 (form-based) and V3 (HTTP). page pay
    // uses V1 (alipay.trade.page.pay) — the legacy method that returns a
    // signed URL the browser navigates to. V3 wraps newer JSON HTTP APIs.
    this.sdk = new AlipaySdk({
      appId: config.appId,
      privateKey: config.privateKey,
      alipayPublicKey: config.alipayPublicKey,
      gateway: config.gateway,
      signType: 'RSA2',
      timeout: 8000,
    });
  }

  /** Returns the URL the browser should navigate to. Caller is responsible for redirecting. */
  async createPagePay(input: {
    outTradeNo: string;
    totalAmount: string;
    subject: string;
  }): Promise<string> {
    // We append out_trade_no to return_url so the success page can poll
    // status without a server-side session.
    const returnUrl = `${this.config.returnUrl}?out_trade_no=${encodeURIComponent(input.outTradeNo)}`;

    const url = await this.sdk.pageExec('alipay.trade.page.pay', {
      bizContent: {
        out_trade_no: input.outTradeNo,
        total_amount: input.totalAmount,
        subject: input.subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      },
      notifyUrl: this.config.notifyUrl,
      returnUrl,
    });
    return url;
  }

  /** Verify Alipay's async notify body. Returns false on bad sig OR malformed input (never throws). */
  verifyNotify(formBody: Record<string, unknown>): boolean {
    try {
      return this.sdk.checkNotifySignV2(formBody);
    } catch {
      return false;
    }
  }

  /** Synchronous query of trade state by our out_trade_no. Used as fallback when notify hasn't arrived. */
  async queryTrade(outTradeNo: string): Promise<QueryResult> {
    try {
      const res: any = await this.sdk.exec('alipay.trade.query', {
        bizContent: { out_trade_no: outTradeNo },
      });
      // Alipay biz codes: 10000 = success, 40004 = business failure, etc.
      if (res.code === '10000' && res.tradeStatus) {
        return {
          tradeStatus: res.tradeStatus as AlipayTradeStatus,
          alipayTradeNo: res.tradeNo ?? null,
        };
      }
      // 40004 + ACQ.TRADE_NOT_EXIST = unknown order. Anything else also no_found / error tier.
      return { tradeStatus: 'NOT_FOUND', alipayTradeNo: null };
    } catch {
      return { tradeStatus: 'ERROR', alipayTradeNo: null };
    }
  }
}
```

- [ ] **Step 2.5: Run tests pass**

Run: `pnpm test -- alipay.test.ts && pnpm typecheck`
Expected: all 7 tests pass; typecheck clean.

If alipay-sdk v4 has a slightly different API (e.g., `pageExecute` vs `pageExec`, or method names changed), fix the implementation, NOT the tests. The tests describe the CONTRACT this module exposes.

- [ ] **Step 2.6: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/alipay.ts tests/lib/alipay.test.ts
git commit -m "$(cat <<'EOF'
feat(alipay): AlipayClient wrapping alipay-sdk v4

Three operations: createPagePay (returns redirect URL), verifyNotify
(boolean from sig check), queryTrade (TRADE_SUCCESS/etc + alipay
trade no). Defensive null-safe on SDK errors so callers can decide.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: MailService class wrapping nodemailer (whatsub-license)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-license/package.json` — add `nodemailer@^6` + `@types/nodemailer`
- Create: `/c/Users/renjx/Desktop/whatsub-license/src/lib/mail.ts`
- Create: `/c/Users/renjx/Desktop/whatsub-license/tests/lib/mail.test.ts`

- [ ] **Step 3.1: Install nodemailer**

```bash
pnpm add nodemailer@^6
pnpm add -D @types/nodemailer
```

- [ ] **Step 3.2: Write failing test**

Create `/c/Users/renjx/Desktop/whatsub-license/tests/lib/mail.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSendMail = vi.fn();
const mockCreateTransport = vi.fn(() => ({ sendMail: mockSendMail }));
vi.mock('nodemailer', () => ({ default: { createTransport: mockCreateTransport } }));

import { MailService } from '../../src/lib/mail.js';

const CONFIG = {
  smtpHost: 'smtp.qq.com',
  smtpPort: 465,
  smtpUser: 'test@qq.com',
  smtpPass: 'fake_authcode',
  fromAddress: 'whatSub <test@qq.com>',
};

describe('MailService.sendLicenseEmail', () => {
  beforeEach(() => {
    mockSendMail.mockReset();
    mockCreateTransport.mockClear();
  });

  it('creates SMTP transport with secure=true on port 465', () => {
    new MailService(CONFIG);
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: { user: 'test@qq.com', pass: 'fake_authcode' },
    });
  });

  it('sends email with key in subject and body, both HTML and text', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'm1' });
    const mail = new MailService(CONFIG);

    await mail.sendLicenseEmail({
      to: 'buyer@example.com',
      key: 'WHATSUB-AAAA-BBBB-CCCC-DDDD',
      outTradeNo: 'ord_abc123def',
      paidAt: new Date('2026-05-10T11:32:00+08:00').getTime(),
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const call = mockSendMail.mock.calls[0][0];
    expect(call.from).toBe('whatSub <test@qq.com>');
    expect(call.to).toBe('buyer@example.com');
    expect(call.subject).toContain('WHATSUB');  // includes key short ref or 订单号
    expect(call.html).toContain('WHATSUB-AAAA-BBBB-CCCC-DDDD');
    expect(call.html).toContain('ord_abc123def');
    expect(call.text).toContain('WHATSUB-AAAA-BBBB-CCCC-DDDD');
    expect(call.text).toContain('ord_abc123def');
    expect(call.text.length).toBeGreaterThan(80); // not just the key
  });

  it('propagates SMTP errors so caller can log them', async () => {
    mockSendMail.mockRejectedValue(new Error('Connection refused'));
    const mail = new MailService(CONFIG);
    await expect(
      mail.sendLicenseEmail({
        to: 'buyer@example.com',
        key: 'WHATSUB-AAAA-BBBB-CCCC-DDDD',
        outTradeNo: 'ord_x',
        paidAt: 0,
      }),
    ).rejects.toThrow('Connection refused');
  });
});
```

- [ ] **Step 3.3: Run failing test**

Run: `pnpm test -- mail.test.ts`
Expected: fails — module doesn't exist.

- [ ] **Step 3.4: Implement MailService**

Create `/c/Users/renjx/Desktop/whatsub-license/src/lib/mail.ts`:

```ts
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  /** "Display Name <addr@domain>" or just "addr@domain". Defaults to smtpUser if absent. */
  fromAddress?: string;
}

export class MailService {
  private transporter: Transporter;
  private from: string;

  constructor(config: MailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });
    this.from = config.fromAddress ?? `whatSub <${config.smtpUser}>`;
  }

  async sendLicenseEmail(input: {
    to: string;
    key: string;
    outTradeNo: string;
    paidAt: number;
  }): Promise<void> {
    const dateStr = new Date(input.paidAt).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const subject = `你的 whatSub 激活码 · ${input.key}`;
    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h2 style="margin:0 0 16px">你好,</h2>
  <p style="margin:0 0 16px">感谢购买 whatSub。这是你的激活码：</p>
  <div style="text-align:center;margin:24px 0">
    <span style="display:inline-block;font-family:'JetBrains Mono',Consolas,monospace;font-size:18px;letter-spacing:1px;background:#f3f4f6;padding:14px 22px;border-radius:8px;font-weight:600">${input.key}</span>
  </div>
  <p style="margin:0 0 8px;font-weight:600">激活步骤：</p>
  <ol style="margin:0 0 16px;padding-left:24px;color:#4b5563">
    <li>下载 whatSub: <a href="https://whatsub.eversay.cc/#download" style="color:#3B9BFF">whatsub.eversay.cc</a></li>
    <li>打开 whatSub，按提示输入上方激活码</li>
    <li>一份激活码可在 3 台个人设备上同时使用</li>
  </ol>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
  <p style="margin:0 0 4px;color:#6b7280;font-size:13px">订单号：<code>${input.outTradeNo}</code></p>
  <p style="margin:0 0 16px;color:#6b7280;font-size:13px">购买时间：${dateStr}</p>
  <p style="margin:0;color:#9ca3af;font-size:12px">如有问题，回复此邮件 或 在小红书私信 @whatSub 客服。</p>
</div>`.trim();

    const text =
      `你好,\n\n` +
      `感谢购买 whatSub。这是你的激活码:\n\n` +
      `  ${input.key}\n\n` +
      `激活步骤:\n` +
      `  1. 下载 whatSub: https://whatsub.eversay.cc/#download\n` +
      `  2. 打开 whatSub，按提示输入上面的激活码\n` +
      `  3. 一份激活码可在 3 台个人设备上同时使用\n\n` +
      `订单号: ${input.outTradeNo}\n` +
      `购买时间: ${dateStr}\n\n` +
      `如有问题，回复此邮件 或 在小红书私信 @whatSub 客服。\n\n` +
      `— whatSub`;

    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject,
      html,
      text,
    });
  }
}
```

- [ ] **Step 3.5: Run tests pass**

Run: `pnpm test -- mail.test.ts && pnpm typecheck`
Expected: 3 tests pass; typecheck clean.

- [ ] **Step 3.6: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/mail.ts tests/lib/mail.test.ts
git commit -m "$(cat <<'EOF'
feat(mail): MailService for license email delivery via SMTP

Mirrors Enghub's MailService minus the resend/console transports —
only SMTP. HTML + text dual templates with the license key, order
ref, and 3-step activation guide.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: payment routes (whatsub-license)

**Files:**
- Create: `/c/Users/renjx/Desktop/whatsub-license/src/routes/payment.ts` — 3 endpoints
- Modify: `/c/Users/renjx/Desktop/whatsub-license/src/index.ts` — register `/api/payment` routes
- Create: `/c/Users/renjx/Desktop/whatsub-license/tests/routes/payment.test.ts`

- [ ] **Step 4.1: Write failing test for create-order endpoint**

Create `/c/Users/renjx/Desktop/whatsub-license/tests/routes/payment.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { Database } from '../../src/lib/db.js';
import { mountPaymentRoutes } from '../../src/routes/payment.js';
import type { AlipayClient } from '../../src/lib/alipay.js';
import type { MailService } from '../../src/lib/mail.js';

// pg-mem fixture helper (likely already in tests/_helpers/) — if not, copy
// from existing tests/lib/db.test.ts
async function freshDb(): Promise<Database> {
  // ...existing helper...
  return null as any; // placeholder; copy from existing pattern
}

function makeMockAlipay(): AlipayClient {
  return {
    createPagePay: vi.fn(),
    verifyNotify: vi.fn(),
    queryTrade: vi.fn(),
  } as unknown as AlipayClient;
}

function makeMockMail(): MailService {
  return { sendLicenseEmail: vi.fn() } as unknown as MailService;
}

function buildApp(deps: {
  db: Database;
  alipay: AlipayClient;
  mail: MailService;
  priceCny: string;
  productName: string;
}): Hono {
  const app = new Hono();
  mountPaymentRoutes(app, deps);
  return app;
}

describe('POST /api/payment/create-order', () => {
  it('creates order, calls Alipay, returns outTradeNo + payUrl', async () => {
    const db = await freshDb();
    const alipay = makeMockAlipay();
    const mail = makeMockMail();
    (alipay.createPagePay as any).mockResolvedValue('https://alipay.example/checkout?x=y');
    const app = buildApp({ db, alipay, mail, priceCny: '29.90', productName: 'whatSub 永久授权' });

    const res = await app.request('/api/payment/create-order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.outTradeNo).toMatch(/^ord_/);
    expect(body.payUrl).toBe('https://alipay.example/checkout?x=y');

    // Order persisted in pending state with the env-provided amount
    const order = await db.getOrder(body.outTradeNo);
    expect(order).toMatchObject({
      email: 'buyer@example.com',
      amountCny: '29.90',
      status: 'pending',
    });

    // Alipay called with our amount, not whatever the client sent
    expect(alipay.createPagePay).toHaveBeenCalledWith(
      expect.objectContaining({
        outTradeNo: body.outTradeNo,
        totalAmount: '29.90',
        subject: 'whatSub 永久授权',
      }),
    );
  });

  it('rejects invalid email with 400', async () => {
    const app = buildApp({
      db: await freshDb(),
      alipay: makeMockAlipay(),
      mail: makeMockMail(),
      priceCny: '29.90',
      productName: 'whatSub 永久授权',
    });
    const res = await app.request('/api/payment/create-order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_email' });
  });
});

describe('GET /api/payment/status/:outTradeNo', () => {
  it('returns paid + licenseKey when order is already paid', async () => {
    const db = await freshDb();
    await db.createOrder({ outTradeNo: 'ord_abc', email: 'b@b.com', amountCny: '29.90', createdAt: 0 });
    await db.markOrderPaidAndMintLicense({
      outTradeNo: 'ord_abc',
      alipayTradeNo: 't1',
      paidAt: 100,
      notifyPayload: {},
      generatedKey: 'WHATSUB-XXXX-YYYY-ZZZZ-AAAA',
    });

    const app = buildApp({
      db,
      alipay: makeMockAlipay(),
      mail: makeMockMail(),
      priceCny: '29.90',
      productName: 'x',
    });
    const res = await app.request('/api/payment/status/ord_abc');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: 'paid',
      licenseKey: 'WHATSUB-XXXX-YYYY-ZZZZ-AAAA',
    });
  });

  it('returns pending without calling Alipay if order < 5s old', async () => {
    const db = await freshDb();
    const now = Date.now();
    await db.createOrder({ outTradeNo: 'ord_new', email: 'b@b.com', amountCny: '29.90', createdAt: now });
    const alipay = makeMockAlipay();
    const app = buildApp({ db, alipay, mail: makeMockMail(), priceCny: '29.90', productName: 'x' });

    const res = await app.request('/api/payment/status/ord_new');
    expect(await res.json()).toEqual({ status: 'pending' });
    expect(alipay.queryTrade).not.toHaveBeenCalled();
  });

  it('falls back to Alipay query after 5s, mints license on TRADE_SUCCESS', async () => {
    const db = await freshDb();
    const oldTimestamp = Date.now() - 10_000; // 10s ago
    await db.createOrder({
      outTradeNo: 'ord_old',
      email: 'b@b.com',
      amountCny: '29.90',
      createdAt: oldTimestamp,
    });
    const alipay = makeMockAlipay();
    (alipay.queryTrade as any).mockResolvedValue({
      tradeStatus: 'TRADE_SUCCESS',
      alipayTradeNo: 'alipay_123',
    });
    const mail = makeMockMail();
    const app = buildApp({ db, alipay, mail, priceCny: '29.90', productName: 'x' });

    const res = await app.request('/api/payment/status/ord_old');
    const body = await res.json();
    expect(body.status).toBe('paid');
    expect(body.licenseKey).toMatch(/^WHATSUB-/);

    // Email sent (because we claimed)
    expect(mail.sendLicenseEmail).toHaveBeenCalledTimes(1);
  });

  it('returns pending on Alipay WAIT_BUYER_PAY (no mint)', async () => {
    const db = await freshDb();
    const oldTimestamp = Date.now() - 10_000;
    await db.createOrder({
      outTradeNo: 'ord_wait',
      email: 'b@b.com',
      amountCny: '29.90',
      createdAt: oldTimestamp,
    });
    const alipay = makeMockAlipay();
    (alipay.queryTrade as any).mockResolvedValue({ tradeStatus: 'WAIT_BUYER_PAY', alipayTradeNo: null });
    const app = buildApp({ db, alipay, mail: makeMockMail(), priceCny: '29.90', productName: 'x' });

    expect(await (await app.request('/api/payment/status/ord_wait')).json()).toEqual({
      status: 'pending',
    });

    expect((await db.getOrder('ord_wait'))!.status).toBe('pending'); // unchanged
  });

  it('returns 404 for unknown out_trade_no', async () => {
    const app = buildApp({
      db: await freshDb(),
      alipay: makeMockAlipay(),
      mail: makeMockMail(),
      priceCny: '29.90',
      productName: 'x',
    });
    const res = await app.request('/api/payment/status/nope');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/payment/notify', () => {
  it('on valid signature + TRADE_SUCCESS: mints license + sends email + returns success', async () => {
    const db = await freshDb();
    await db.createOrder({ outTradeNo: 'ord_n1', email: 'n1@x.com', amountCny: '29.90', createdAt: 0 });
    const alipay = makeMockAlipay();
    (alipay.verifyNotify as any).mockReturnValue(true);
    const mail = makeMockMail();
    const app = buildApp({ db, alipay, mail, priceCny: '29.90', productName: 'x' });

    const formBody = new URLSearchParams({
      out_trade_no: 'ord_n1',
      trade_status: 'TRADE_SUCCESS',
      trade_no: 'alipay_n1',
      sign: 'fake_sig',
    });
    const res = await app.request('/api/payment/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('success');

    const order = await db.getOrder('ord_n1');
    expect(order!.status).toBe('paid');
    expect(order!.alipayTradeNo).toBe('alipay_n1');
    expect(mail.sendLicenseEmail).toHaveBeenCalledTimes(1);
  });

  it('returns failure (text) when sig invalid; does not change order', async () => {
    const db = await freshDb();
    await db.createOrder({ outTradeNo: 'ord_n2', email: 'n2@x.com', amountCny: '29.90', createdAt: 0 });
    const alipay = makeMockAlipay();
    (alipay.verifyNotify as any).mockReturnValue(false);
    const mail = makeMockMail();
    const app = buildApp({ db, alipay, mail, priceCny: '29.90', productName: 'x' });

    const formBody = new URLSearchParams({ out_trade_no: 'ord_n2', trade_status: 'TRADE_SUCCESS', sign: 'bad' });
    const res = await app.request('/api/payment/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });
    expect(await res.text()).toBe('failure');
    expect((await db.getOrder('ord_n2'))!.status).toBe('pending');
    expect(mail.sendLicenseEmail).not.toHaveBeenCalled();
  });

  it('idempotent: 2nd notify with same out_trade_no returns success without double-mint', async () => {
    const db = await freshDb();
    await db.createOrder({ outTradeNo: 'ord_n3', email: 'n3@x.com', amountCny: '29.90', createdAt: 0 });
    const alipay = makeMockAlipay();
    (alipay.verifyNotify as any).mockReturnValue(true);
    const mail = makeMockMail();
    const app = buildApp({ db, alipay, mail, priceCny: '29.90', productName: 'x' });

    const fire = () => {
      const formBody = new URLSearchParams({
        out_trade_no: 'ord_n3',
        trade_status: 'TRADE_SUCCESS',
        trade_no: 'alipay_n3',
        sign: 'ok',
      });
      return app.request('/api/payment/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });
    };

    expect(await (await fire()).text()).toBe('success');
    expect(await (await fire()).text()).toBe('success');

    expect(mail.sendLicenseEmail).toHaveBeenCalledTimes(1);
  });

  it('returns success (not failure) for unknown out_trade_no — to stop Alipay retries', async () => {
    const alipay = makeMockAlipay();
    (alipay.verifyNotify as any).mockReturnValue(true);
    const app = buildApp({
      db: await freshDb(),
      alipay,
      mail: makeMockMail(),
      priceCny: '29.90',
      productName: 'x',
    });
    const formBody = new URLSearchParams({ out_trade_no: 'phantom', trade_status: 'TRADE_SUCCESS', sign: 'ok' });
    const res = await app.request('/api/payment/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });
    expect(await res.text()).toBe('success');
  });

  it('email send failure does NOT undo paid status', async () => {
    const db = await freshDb();
    await db.createOrder({ outTradeNo: 'ord_email_fail', email: 'x@x.com', amountCny: '29.90', createdAt: 0 });
    const alipay = makeMockAlipay();
    (alipay.verifyNotify as any).mockReturnValue(true);
    const mail = makeMockMail();
    (mail.sendLicenseEmail as any).mockRejectedValue(new Error('SMTP down'));
    const app = buildApp({ db, alipay, mail, priceCny: '29.90', productName: 'x' });

    const formBody = new URLSearchParams({
      out_trade_no: 'ord_email_fail',
      trade_status: 'TRADE_SUCCESS',
      trade_no: 'a',
      sign: 'ok',
    });
    const res = await app.request('/api/payment/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });
    expect(await res.text()).toBe('success');
    expect((await db.getOrder('ord_email_fail'))!.status).toBe('paid');
  });
});
```

- [ ] **Step 4.2: Run failing test**

Run: `pnpm test -- payment.test.ts`
Expected: fails — module doesn't exist.

- [ ] **Step 4.3: Implement payment routes**

Create `/c/Users/renjx/Desktop/whatsub-license/src/routes/payment.ts`:

```ts
import type { Hono } from 'hono';
import { randomUUID } from 'node:crypto';
import type { Database } from '../lib/db.js';
import type { AlipayClient } from '../lib/alipay.js';
import type { MailService } from '../lib/mail.js';
import { generateLicenseKey } from '../lib/keygen.js';

interface PaymentDeps {
  db: Database;
  alipay: AlipayClient;
  mail: MailService;
  priceCny: string;
  productName: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUERY_FALLBACK_GRACE_MS = 5_000;

export function mountPaymentRoutes(app: Hono, deps: PaymentDeps): void {
  app.post('/api/payment/create-order', async (c) => {
    let body: { email?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'invalid_email' }, 400);
    }
    if (!body.email || !EMAIL_RE.test(body.email)) {
      return c.json({ error: 'invalid_email' }, 400);
    }

    const outTradeNo = `ord_${randomUUID()}`;
    const createdAt = Date.now();
    await deps.db.createOrder({
      outTradeNo,
      email: body.email,
      amountCny: deps.priceCny,
      createdAt,
    });

    let payUrl: string;
    try {
      payUrl = await deps.alipay.createPagePay({
        outTradeNo,
        totalAmount: deps.priceCny,
        subject: deps.productName,
      });
    } catch (e) {
      console.error('createPagePay failed:', e);
      return c.json({ error: 'alipay_unavailable' }, 502);
    }

    return c.json({ outTradeNo, payUrl });
  });

  app.get('/api/payment/status/:outTradeNo', async (c) => {
    const outTradeNo = c.req.param('outTradeNo');
    const order = await deps.db.getOrder(outTradeNo);
    if (!order) return c.json({ error: 'order_not_found' }, 404);

    if (order.status === 'paid') {
      return c.json({ status: 'paid', licenseKey: order.licenseKey });
    }
    if (order.status === 'expired' || order.status === 'cancelled') {
      return c.json({ status: order.status });
    }

    // Pending — try Alipay query fallback if old enough
    const age = Date.now() - order.createdAt;
    if (age < QUERY_FALLBACK_GRACE_MS) {
      return c.json({ status: 'pending' });
    }

    let queryRes;
    try {
      queryRes = await deps.alipay.queryTrade(outTradeNo);
    } catch (e) {
      console.error('queryTrade failed:', e);
      return c.json({ status: 'pending' });
    }
    if (queryRes.tradeStatus === 'TRADE_SUCCESS' || queryRes.tradeStatus === 'TRADE_FINISHED') {
      const generatedKey = generateLicenseKey();
      const result = await deps.db.markOrderPaidAndMintLicense({
        outTradeNo,
        alipayTradeNo: queryRes.alipayTradeNo ?? `query_${Date.now()}`,
        paidAt: Date.now(),
        notifyPayload: { source: 'query', tradeStatus: queryRes.tradeStatus },
        generatedKey,
      });
      if (result.claimed && result.email) {
        deps.mail
          .sendLicenseEmail({
            to: result.email,
            key: result.licenseKey!,
            outTradeNo,
            paidAt: Date.now(),
          })
          .catch((e) => console.error('sendLicenseEmail (query path) failed:', e));
      }
      return c.json({ status: 'paid', licenseKey: result.licenseKey });
    }
    // WAIT_BUYER_PAY / TRADE_CLOSED / NOT_FOUND / ERROR — keep pending,
    // let 60s client timeout decide.
    return c.json({ status: 'pending' });
  });

  app.post('/api/payment/notify', async (c) => {
    // Alipay sends form-urlencoded
    const form = await c.req.parseBody();
    const formBody: Record<string, string> = {};
    for (const [k, v] of Object.entries(form)) {
      if (typeof v === 'string') formBody[k] = v;
    }

    if (!deps.alipay.verifyNotify(formBody)) {
      console.warn('notify: bad signature', { out_trade_no: formBody.out_trade_no });
      return c.text('failure', 200);
    }

    const tradeStatus = formBody.trade_status;
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      // Other statuses (WAIT_BUYER_PAY, TRADE_CLOSED) — acknowledge but no-op.
      return c.text('success', 200);
    }

    const outTradeNo = formBody.out_trade_no;
    if (!outTradeNo) return c.text('success', 200); // malformed — acknowledge to stop retries

    const order = await deps.db.getOrder(outTradeNo);
    if (!order) {
      console.warn('notify: unknown out_trade_no', { outTradeNo });
      return c.text('success', 200); // phantom order — acknowledge to stop retries
    }
    if (order.status === 'paid') {
      return c.text('success', 200); // idempotent
    }

    const generatedKey = generateLicenseKey();
    const result = await deps.db.markOrderPaidAndMintLicense({
      outTradeNo,
      alipayTradeNo: formBody.trade_no ?? '',
      paidAt: Date.now(),
      notifyPayload: formBody,
      generatedKey,
    });

    if (result.claimed && result.email) {
      try {
        await deps.mail.sendLicenseEmail({
          to: result.email,
          key: result.licenseKey!,
          outTradeNo,
          paidAt: Date.now(),
        });
      } catch (e) {
        console.error('sendLicenseEmail (notify path) failed:', e);
        // Email failure does NOT undo the mint — admin can re-send manually.
      }
    }
    return c.text('success', 200);
  });
}
```

- [ ] **Step 4.4: Wire payment routes into the app + register in CLI entrypoint**

Modify `/c/Users/renjx/Desktop/whatsub-license/src/index.ts`. Find the `buildApp()` function (or wherever the existing routes mount). Add after the existing route mounts:

```ts
import { AlipayClient } from './lib/alipay.js';
import { MailService } from './lib/mail.js';
import { mountPaymentRoutes } from './routes/payment.js';

// ... inside buildApp() or equivalent, after the existing mounts ...
const alipay = new AlipayClient({
  appId: requireEnv('ALIPAY_APP_ID'),
  privateKey: requireEnv('ALIPAY_PRIVATE_KEY'),
  alipayPublicKey: requireEnv('ALIPAY_PUBLIC_KEY'),
  gateway: requireEnv('ALIPAY_GATEWAY'),
  notifyUrl: requireEnv('ALIPAY_NOTIFY_URL'),
  returnUrl: requireEnv('ALIPAY_RETURN_URL'),
});
const mail = new MailService({
  smtpHost: requireEnv('SMTP_HOST'),
  smtpPort: Number(requireEnv('SMTP_PORT')),
  smtpUser: requireEnv('SMTP_USER'),
  smtpPass: requireEnv('SMTP_PASS'),
  fromAddress: process.env.SMTP_FROM_EMAIL,
});
mountPaymentRoutes(app, {
  db,
  alipay,
  mail,
  priceCny: requireEnv('LICENSE_PRICE_CNY'),
  productName: requireEnv('LICENSE_PRODUCT_NAME'),
});
```

Use the existing `requireEnv` helper if there is one, or write a tiny inline:

```ts
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`FATAL: missing env var ${name}`);
    process.exit(1);
  }
  return v;
}
```

(Match whatever the existing index.ts pattern is — don't re-invent.)

- [ ] **Step 4.5: Run tests pass**

Run: `pnpm test && pnpm typecheck`
Expected: existing 52 tests + new payment tests all pass; typecheck clean.

- [ ] **Step 4.6: Commit**

```bash
git add src/routes/payment.ts src/index.ts tests/routes/payment.test.ts
git commit -m "$(cat <<'EOF'
feat(payment): 3 endpoints for Alipay create-order / status / notify

create-order: validates email, INSERT pending row, returns redirect URL.
status: poll target — fast-path returns paid; pending+>5s falls back
  to Alipay query API and mints if confirmed.
notify: verifies signature, atomic mint via DB CTE (idempotent),
  triggers email. Returns 'success' even on phantom orders / verified
  non-success status to stop Alipay's 8-retry storm.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Pending order cleanup setInterval (whatsub-license)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-license/src/index.ts` — add periodic cleanup task

- [ ] **Step 5.1: Add cleanup loop**

In `src/index.ts`, after the server starts listening, add:

```ts
// Periodic cleanup: expire pending orders > 24h old. Single in-process
// timer is fine — single container, single instance. Logs each batch.
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // run once a day

async function expireOldPendingOrders() {
  try {
    const olderThan = Date.now() - ONE_DAY_MS;
    const expired = await db.findExpiredPendingOrders({ olderThan });
    if (expired.length === 0) return;
    await db.expireOrders(expired.map((o) => o.outTradeNo));
    console.log(`[cleanup] expired ${expired.length} pending orders older than 24h`);
  } catch (e) {
    console.error('[cleanup] failed:', e);
  }
}

// Don't await; let it run async. Run once on boot to clear backlog,
// then every 24h.
void expireOldPendingOrders();
setInterval(() => void expireOldPendingOrders(), CLEANUP_INTERVAL_MS);
```

(Place this after `db` is constructed and before/after `serve(...)` per your existing index.ts layout.)

- [ ] **Step 5.2: Smoke test it runs without crashing**

Run: `pnpm typecheck && pnpm test`
Expected: typecheck clean, all tests pass.

- [ ] **Step 5.3: Commit**

```bash
git add src/index.ts
git commit -m "feat(payment): periodic cleanup of pending orders >24h old"
```

---

## Task 6: env + CLAUDE.md (whatsub-license)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-license/.env.example`
- Modify: `/c/Users/renjx/Desktop/whatsub-license/CLAUDE.md`

- [ ] **Step 6.1: Append payment env vars to .env.example**

Append to `/c/Users/renjx/Desktop/whatsub-license/.env.example`:

```bash

# ── Alipay (电脑网站支付 v3) ───────────────────────────────────
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
# Sandbox alternative: https://openapi-sandbox.dl.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=https://whatsub.eversay.cc/api/license/payment/notify
ALIPAY_RETURN_URL=https://whatsub.eversay.cc/payment/success

# ── 商品定价 ───────────────────────────────────────────────────
LICENSE_PRICE_CNY=29.9
LICENSE_PRODUCT_NAME=whatSub 永久授权

# ── QQ SMTP (邮件交付授权码) ────────────────────────────────────
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
```

- [ ] **Step 6.2: Update CLAUDE.md**

Modify `/c/Users/renjx/Desktop/whatsub-license/CLAUDE.md`:

1. Under "What it does" add a 4th bullet:

```md
4. **`POST /api/payment/{create-order,status/:no,notify}`** — Alipay 电脑网站支付 v3 endpoints. create-order INSERTs a pending order + returns Alipay redirect URL. status is the success-page poll target (with Alipay query API fallback after 5s grace). notify is Alipay's async webhook — verifies signature, atomic mint via CTE, sends email.
```

2. Under "Stack" add a row:

```md
| Payment | **alipay-sdk@^4** + **nodemailer@^6** (QQ SMTP). Same single Hono app — no separate microservice. |
```

3. Under "Layout" add the new files in `src/lib/` and `src/routes/payment.ts`. Update line counts / file list to reflect reality.

4. Under "Quick map" add rows:

```md
| Adjust price | `/opt/whatsub/.env` `LICENSE_PRICE_CNY` (no rebuild needed; restart container) |
| Switch sandbox ↔ prod Alipay | `/opt/whatsub/.env` `ALIPAY_GATEWAY` + ALIPAY_APP_ID + ALIPAY_PRIVATE_KEY + ALIPAY_PUBLIC_KEY (restart container, no rebuild) |
| Change email template | `src/lib/mail.ts` — `sendLicenseEmail` html/text strings |
| Add an order column | `schema.sql` (additive) + `Database.OrderRow` type + relevant SELECT methods |
| Re-deliver a license email manually | admin SPA "Recent orders" tab → "Resend email" button (TBD; for now: log into psql + sendmail manually) |
```

5. Under "Key design decisions" add:

```md
9. **Atomic mint via CTE.** `markOrderPaidAndMintLicense` uses a single SQL with WITH-UPDATE-RETURNING + INSERT...ON CONFLICT, gated by `WHERE status='pending'`. This guarantees only the first arrival (whether notify or query fallback) mints + sends email. The second arrival sees `status='paid'` and the UPDATE matches 0 rows — CTE empty, INSERT no-op, claimed=false returned. No need for table-level locks or advisory locks.

10. **Alipay query as defensive fallback, not primary path.** Notify webhook is the canonical event; query is ONLY called from the status-poll handler when an order is still `pending` after a 5s grace window. This bounds the extra Alipay API load (no spam during the typical happy-path 1-2s notify window) while still recovering when notify is delayed/lost.
```

- [ ] **Step 6.3: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "docs(payment): env template + CLAUDE.md for Alipay integration"
```

---

## Task 7: Sandbox deploy + backend smoke (whatsub-license)

**Files:** None (server ops + smoke commands)

- [ ] **Step 7.1: Confirm sandbox creds with user**

Before doing anything destructive on the server, confirm with user:
- ALIPAY_APP_ID (sandbox)
- ALIPAY_PRIVATE_KEY (sandbox, RSA2 PKCS8 PEM, multi-line escaped to \n)
- ALIPAY_PUBLIC_KEY (sandbox, from Alipay sandbox console)
- SMTP_USER + SMTP_PASS (QQ 授权码)

If user doesn't have them yet, STOP — do not deploy. Tell user to grab from open.alipay.com → Tools → Sandbox.

- [ ] **Step 7.2: Update server `.env`**

Use scp + ssh (per whatsub-license CLAUDE.md deploy patterns) to edit `/opt/whatsub/.env`:

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 'cat >> /opt/whatsub/.env << EOF
ALIPAY_APP_ID=<sandbox-appid>
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=https://whatsub.eversay.cc/api/license/payment/notify
ALIPAY_RETURN_URL=https://whatsub.eversay.cc/payment/success
LICENSE_PRICE_CNY=29.9
LICENSE_PRODUCT_NAME=whatSub 永久授权
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=<your-qq>@qq.com
SMTP_PASS=<qq-auth-code>
SMTP_FROM_EMAIL="whatSub <<your-qq>@qq.com>"
EOF
chmod 600 /opt/whatsub/.env'
```

(Or upload a fully-formed .env via `scp .env.local root@47.93.87.206:/opt/whatsub/.env` and chmod afterward.)

- [ ] **Step 7.3: Apply schema migration**

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 'cd /opt/whatsub && \
  docker compose -f /opt/enghub/docker-compose.yml exec -T postgres \
    psql -U whatsub_license_user -d whatsub_license' < /c/Users/renjx/Desktop/whatsub-license/schema.sql
```

Expected: silent success (CREATE TABLE / INDEX IF NOT EXISTS = idempotent).

- [ ] **Step 7.4: Build + ship + load image**

```bash
cd /c/Users/renjx/Desktop/whatsub-license
docker build -t whatsub-license:latest .
docker save whatsub-license:latest | gzip > /tmp/whatsub-license.tar.gz
scp -i ~/.ssh/id_ed25519 /tmp/whatsub-license.tar.gz root@47.93.87.206:/tmp/

ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 "
  docker load < /tmp/whatsub-license.tar.gz &&
  cd /opt/whatsub &&
  docker compose --env-file .env up -d --force-recreate &&
  rm /tmp/whatsub-license.tar.gz &&
  docker logs whatsub-license --tail 30
"
```

Expected: container boots, logs show "listening on :3002" + cleanup task fires.

- [ ] **Step 7.5: Smoke test create-order**

```bash
curl -X POST https://whatsub.eversay.cc/api/license/payment/create-order \
  -H 'content-type: application/json' \
  -d '{"email":"smoke-test@example.com"}'
```

Expected: 200 with `{ "outTradeNo": "ord_...", "payUrl": "https://openapi-sandbox.dl.alipaydev.com/gateway.do?..." }`.

Open `payUrl` in a browser — should land on Alipay sandbox checkout page.

- [ ] **Step 7.6: Smoke test status (pending)**

```bash
# Use the outTradeNo from previous step
curl https://whatsub.eversay.cc/api/license/payment/status/ord_<uuid>
```

Expected (immediately): `{ "status": "pending" }` (because <5s old).
After waiting >5s and re-running: still `pending` (because no payment yet — TRADE_CLOSED or WAIT_BUYER_PAY from query).

- [ ] **Step 7.7: Smoke test 404**

```bash
curl -i https://whatsub.eversay.cc/api/license/payment/status/nonexistent
```

Expected: 404 + `{ "error": "order_not_found" }`.

If all three smokes pass → backend ready for frontend integration.

---

## Task 8: payment-api lib (whatsub-website)

**Files:**
- Create: `/c/Users/renjx/Desktop/whatsub-website/src/lib/payment-api.ts`

- [ ] **Step 8.1: Create the API wrapper**

```ts
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
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getPaymentStatus(outTradeNo: string): Promise<PaymentStatus> {
  const res = await fetch(`${API_BASE}/payment/status/${encodeURIComponent(outTradeNo)}`);
  if (res.status === 404) return { status: 'cancelled' }; // treat unknown order as cancelled in UI
  if (!res.ok) throw new Error('status_request_failed');
  return res.json();
}
```

- [ ] **Step 8.2: Typecheck**

```bash
cd /c/Users/renjx/Desktop/whatsub-website
pnpm typecheck
```

Expected: clean.

No tests for this thin wrapper — tested transitively via the components in next tasks.

- [ ] **Step 8.3: Commit**

```bash
git add src/lib/payment-api.ts
git commit -m "feat(payment): add fetch wrappers for create-order + status"
```

---

## Task 9: Pricing component email form + 立即购买 CTA (whatsub-website)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-website/src/components/Pricing.tsx`

- [ ] **Step 9.1: Replace single CTA with email form + small xhs fallback**

Edit `/c/Users/renjx/Desktop/whatsub-website/src/components/Pricing.tsx`. Replace the existing `<a href={LINKS.xhsStore} ...>在小红书购买</a>` block with:

```tsx
'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { LINKS, PRICING } from '@/lib/constants';
import { createOrder } from '@/lib/payment-api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Pricing() {
  const ref = useReveal<HTMLElement>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setBusy(true);
    try {
      const { payUrl } = await createOrder(email);
      window.location.href = payUrl;
    } catch (err) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : 'unknown';
      setError(msg === 'invalid_email' ? '邮箱格式不正确' : '网络异常，请稍后再试');
    }
  };

  return (
    <section
      ref={ref}
      id="pricing"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-14 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          一份授权,<span className="text-accent">3 台设备</span>
        </h2>

        <div
          className="reveal reveal-delay-1 mx-auto max-w-[480px] rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-8 sm:p-10"
          style={{ boxShadow: '0 0 80px rgba(59,155,255,0.05)' }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[--ink-faint]">
            授权方式
          </p>

          <div className="mb-3 flex items-baseline gap-3">
            <span className="text-7xl font-bold leading-none text-ink">
              {PRICING.amount}
            </span>
            {PRICING.originalAmount ? (
              <span className="text-2xl text-[--ink-faint] line-through">
                {PRICING.originalAmount}
              </span>
            ) : null}
            {PRICING.period ? (
              <span className="text-2xl text-[--ink-faint]">
                {PRICING.period}
              </span>
            ) : null}
          </div>
          <p className="mb-8 text-sm text-[--ink-soft]">{PRICING.label}</p>

          <ul className="mb-8 space-y-3">
            {PRICING.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-[--ink-soft]">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} className="mb-3 space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="邮箱地址，授权码会发到这里"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="block w-full rounded-lg border border-[--hairline-strong] bg-bg/50 px-4 py-3 text-sm text-ink placeholder:text-[--ink-faint] focus:border-accent focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !email}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              style={{ boxShadow: '0 0 0 1px rgba(59,155,255,0.4), 0 0 32px var(--accent-glow)' }}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              {busy ? '处理中...' : '立即购买 · 跳转支付宝'}
            </button>
            {error ? (
              <p className="text-center text-xs text-red-400">{error}</p>
            ) : null}
          </form>

          <p className="text-center text-xs text-[--ink-faint]">
            或{' '}
            <a
              href={LINKS.xhsStore}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-[--ink-muted]"
            >
              私信小红书购买
            </a>
            {' · '}
            数字商品售出不退
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9.2: Verify in dev server**

```bash
cd /c/Users/renjx/Desktop/whatsub-website
pnpm dev
```

Open http://localhost:3000/#pricing — input email + click button. With backend NOT running locally, you should see "网络异常..." inline (the fetch fails). When backend is reachable (Task 7 deployed), the button should redirect to Alipay sandbox.

- [ ] **Step 9.3: Typecheck**

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 9.4: Commit**

```bash
git add src/components/Pricing.tsx
git commit -m "feat(pricing): email form + 立即购买 → Alipay redirect"
```

---

## Task 10: /payment/success polling page (whatsub-website)

**Files:**
- Create: `/c/Users/renjx/Desktop/whatsub-website/src/app/payment/success/page.tsx`

- [ ] **Step 10.1: Create success page with Suspense + polling**

```tsx
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

  const [state, setState] = useState<PaymentStatus | { status: 'loading' } | { status: 'timeout' }>(
    { status: 'loading' },
  );
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
        // transient — keep polling
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
            // ignore — user can manually copy
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
```

- [ ] **Step 10.2: Run dev to verify SSR/SSG works with Suspense**

```bash
pnpm dev
```

Open http://localhost:3000/payment/success?out_trade_no=ord_test — should render the loading spinner state without crashing. (Polling will fail to /api/license/payment/status/ord_test if backend isn't running, but the Suspense + page render should NOT throw.)

- [ ] **Step 10.3: Build to verify static export works**

```bash
pnpm build
ls /c/Users/renjx/Desktop/whatsub-website/out/payment/success/
```

Expected: `index.html` exists at `out/payment/success/index.html`.

If build fails with "useSearchParams() should be wrapped in a suspense boundary" — confirm the Suspense boundary in `PaymentSuccessPage` actually wraps `SuccessInner` (it does in the template above). If still fails, double-check Next 14 + static export Suspense rules.

- [ ] **Step 10.4: Typecheck**

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 10.5: Commit**

```bash
git add src/app/payment/success/page.tsx
git commit -m "feat(payment): /payment/success polling page

Polls /api/license/payment/status/:no every 1.5s; shows license key +
copy button on success; falls back to support contact + order ref on
60s timeout. Suspense-wrapped useSearchParams for static export."
```

---

## Task 11: Update whatsub-website CLAUDE.md (whatsub-website)

**Files:**
- Modify: `/c/Users/renjx/Desktop/whatsub-website/CLAUDE.md`

- [ ] **Step 11.1: Update layout section**

Add `src/app/payment/success/page.tsx` and `src/lib/payment-api.ts` to the layout tree. Update Pricing description to reflect the new email form.

- [ ] **Step 11.2: Add design decision**

Append to "Key design decisions":

```md
13. **Pricing has an email form, not a static link.** The 立即购买 button posts to `/api/license/payment/create-order` with the buyer's email; the response includes a redirect URL the browser navigates to (Alipay 收银台). On successful payment, Alipay returns the user to `/payment/success?out_trade_no=...`, which polls our backend for the minted license key. 小红书 entry is preserved as a small fallback link in case the Alipay path has issues. License-key-by-email is the source of truth (the spec doc explains the notify + query-fallback mint flow): see `docs/superpowers/specs/2026-05-10-alipay-payment-design.md`.
```

- [ ] **Step 11.3: Add gotcha**

Append to "Gotchas":

```md
- **`useSearchParams()` in `/payment/success` MUST be inside a `<Suspense>` boundary** for `output: 'export'` to build. The page wraps `SuccessInner` (which calls `useSearchParams()`) in `<Suspense>`. Don't refactor it out without testing `pnpm build`.
- **The poll page hard-stops at 60 seconds.** After timeout it shows a "联系客服" branch with the order ref — buyers who pay successfully but don't get a synchronous mint can still recover via email (delivered async) or admin support.
```

- [ ] **Step 11.4: Update quick map**

Replace existing "Change pricing" row with:

```md
| Adjust price (display + paid amount) | Display: `src/lib/constants.ts` `PRICING.amount`. Backend amount: `/opt/whatsub/.env` `LICENSE_PRICE_CNY`. **Both must agree** — frontend price is just visual; backend is the source of truth Alipay charges. |
```

Add row:

```md
| Change "立即购买" copy / disable Alipay path | `src/components/Pricing.tsx` — replace the form with the old `<a href={LINKS.xhsStore}>` block; rebuild + redeploy |
```

- [ ] **Step 11.5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md updates for Alipay payment integration"
```

---

## Task 12: Build + deploy frontend (whatsub-website)

**Files:** None (build + deploy commands)

- [ ] **Step 12.1: Build**

```bash
cd /c/Users/renjx/Desktop/whatsub-website
pnpm build
```

Expected: clean build, `out/` populated, includes `out/payment/success/index.html`.

- [ ] **Step 12.2: Deploy via tarball + in-place extract**

```bash
tar czf /tmp/whatsub-web.tar.gz -C /c/Users/renjx/Desktop/whatsub-website/out .

scp -i ~/.ssh/id_ed25519 /tmp/whatsub-web.tar.gz root@47.93.87.206:/tmp/

ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 "
  rm -rf /data/whatsub-web/* &&
  tar xzf /tmp/whatsub-web.tar.gz -C /data/whatsub-web/ &&
  rm /tmp/whatsub-web.tar.gz
"

curl -sI https://whatsub.eversay.cc/payment/success | head -3
```

Expected: `200 OK` for the success page.

---

## Task 13: Sandbox e2e walkthrough

**Files:** None (manual test, optional automated script)

- [ ] **Step 13.1: Sandbox buyer setup**

Login at `https://opendocs.alipay.com → 工具 → 沙箱` to get a sandbox **buyer account** (different from the seller account that owns the APP). Note its login + payment password.

- [ ] **Step 13.2: Walk through the full flow**

1. Open `https://whatsub.eversay.cc/#pricing`
2. Enter your test email (real one — to verify SMTP) → 立即购买
3. On the Alipay sandbox checkout page, log in with the sandbox buyer + pay
4. Should redirect to `https://whatsub.eversay.cc/payment/success?out_trade_no=ord_...`
5. Within 5–10 seconds, the polling state should switch to "购买成功" + show a `WHATSUB-XXXX-XXXX-XXXX-XXXX` license key
6. Email should arrive at the test address within 1–2 minutes (check spam folder if not in inbox)
7. Click the copy button → paste somewhere → confirm key matches what's on screen
8. Open the desktop app → activate with the key → should succeed first try

- [ ] **Step 13.3: Validation queries**

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 \
  "docker compose -f /opt/enghub/docker-compose.yml exec -T postgres \
   psql -U whatsub_license_user -d whatsub_license -c \
   'SELECT out_trade_no, email, status, license_key, paid_at FROM orders ORDER BY created_at DESC LIMIT 5;'"
```

Expected: your test order shows `status='paid'`, `license_key` matches what was emailed.

- [ ] **Step 13.4: Backup-path test (kill notify, force query fallback)**

If you want to verify the query fallback specifically:
1. Trigger another sandbox purchase but DO NOT visit /payment/success right after
2. Wait ~10 seconds (so notify almost certainly already arrived and minted)
3. Open /payment/success?out_trade_no=ord_... — should show the key immediately because order is already paid

To explicitly force query fallback (notify rejected): temporarily comment out `notify` route registration on staging, redo a purchase, observe success page recovers via query API in ~7s. Re-enable notify after.

---

## Task 14: Switch to production credentials

**Files:** None (server ops)

**ONLY DO THIS AFTER Task 13 fully passes in sandbox.**

- [ ] **Step 14.1: Get production creds from user**

Confirm with user:
- Production ALIPAY_APP_ID
- Production ALIPAY_PRIVATE_KEY
- Production ALIPAY_PUBLIC_KEY (Alipay's, from prod console)

If they're not ready yet, STOP — keep sandbox running until they are.

- [ ] **Step 14.2: Update server env**

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 'sed -i \
  -e "s|^ALIPAY_APP_ID=.*|ALIPAY_APP_ID=<prod-appid>|" \
  -e "s|^ALIPAY_GATEWAY=.*|ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do|" \
  /opt/whatsub/.env'
# Replace ALIPAY_PRIVATE_KEY + ALIPAY_PUBLIC_KEY similarly. Use scp to upload
# fresh .env if the multi-line PEMs are awkward to sed-replace.
```

Or simpler: edit `.env.production.local` locally and `scp` it to `/opt/whatsub/.env` (preserve chmod 600 afterward).

- [ ] **Step 14.3: Restart container (no rebuild)**

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 \
  "cd /opt/whatsub && docker compose --env-file .env up -d --force-recreate && \
   docker logs whatsub-license --tail 30"
```

Expected: container restarts cleanly. New ALIPAY_GATEWAY in logs.

- [ ] **Step 14.4: Production smoke test (real ¥29.9)**

Buy one yourself with your real Alipay account:
1. /#pricing → buy with your email
2. Pay ¥29.9
3. Verify: /payment/success shows the key + email arrives + `orders` table has paid row + you can activate the key in desktop app

If anything fails, rollback to sandbox by restoring sandbox values in `.env` and `--force-recreate`. Investigate. Don't open to public until smoke passes.

- [ ] **Step 14.5: Issue refund for the smoke purchase**

To avoid polluting real revenue data:
1. Login to Alipay merchant console (open.alipay.com)
2. 交易管理 → find the smoke order → click 退款
3. After refund completes (instant), in the admin SPA mark the corresponding order as `cancelled` (or write a small SQL:

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 \
  "docker compose -f /opt/enghub/docker-compose.yml exec -T postgres \
   psql -U whatsub_license_user -d whatsub_license -c \
   \"UPDATE orders SET status='cancelled' WHERE out_trade_no='ord_<your-smoke-no>';\""
```

(Refunds in the data layer are intentionally unsupported — this is a one-off for the smoke purchase.)

- [ ] **Step 14.6: Open to public**

After successful smoke:
- Tell user the integration is live
- Keep an eye on `docker logs whatsub-license --tail 100 -f` for the first ~24 hours to catch unexpected errors
- Watch SMTP send rate (QQ has limits around 100/day for free accounts; if you start to approach, switch to a paid SMTP plan or Aliyun DirectMail)
- Consider adding the admin SPA "Recent orders" tab as a follow-up Phase 2 task

---

## Self-Review

Spec coverage check (skim spec sections vs plan tasks):

- §1 Goals + non-goals → Goals captured implicitly via tasks 1–14 covering full e2e ✓ Non-goals (refunds, sandbox-skipping, multi-SKU) explicit in plan task 14 step 5 ✓
- §2 Decisions → Embedded into task code/comments ✓
- §3 Architecture + 3 timelines → Notify (Task 4), Query (Task 4), Polling (Task 10) all present ✓
- §4 Backend (schema, modules, endpoints, atomic mint) → Tasks 1–4 ✓
- §5 Frontend (Pricing form, success page, fallback) → Tasks 8–10 ✓
- §6 Configuration → Task 6 (.env.example) + Task 7 (server env) + Task 14 (prod env) ✓
- §7 Error handling → covered in code blocks (verify failure, idempotent notify, email failure non-blocking) ✓
- §8 Testing strategy → Task tests cover unit + route layers; sandbox e2e in Task 13 ✓
- §9 Deploy sequence → Tasks 7 + 12 follow backend-first → frontend-second ✓
- §10 Acceptance criteria → Manual validation in Task 13 ✓
- §11 Implementation order → This entire plan IS the elaborated 11-step order ✓
- §12 Open items → Task 7.1 + 14.1 explicitly check user has provided credentials ✓

Placeholder scan: no `TBD` / `add appropriate error handling` / "similar to Task N" — every step has the actual code or commands. ✓

Type consistency: `OrderRow.outTradeNo` (camelCase) used uniformly through tasks 1–4. `MintLicenseResult.claimed/licenseKey/email` consistent in db.ts and payment.ts. `PaymentStatus.licenseKey` matches in payment-api.ts and Page. ✓

Cross-task references: `generateLicenseKey()` called in Task 4 — comes from existing `src/lib/keygen.ts` (referenced in task 4's import block + whatsub-license CLAUDE.md). `freshDb()` referenced in Tasks 1 + 4 — instructed to copy from existing tests/lib/db.test.ts pattern. ✓

No issues found.
