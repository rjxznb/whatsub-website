'use client';

import { useCallback, useEffect, useState } from 'react';
import { validatePromo, type PromoValidation } from '@/lib/payment-api';

const STORAGE_KEY = 'whatsub_promo';
const POLL_MS = 30_000;
const TICK_MS = 1_000;

type PromoErrorReason = Extract<PromoValidation, { valid: false }>['reason'];

export type PromoStatus =
  | { status: 'idle' }
  | { status: 'pending'; code: string }
  | {
      status: 'active_promotion';
      code: string;
      key: string;
      finalPrice: string;
      maxUses: number | null;
      usesCount: number;
      remaining: number | null;
      validUntil: number | null;
      remainingMs: number | null;
    }
  | { status: 'active_coupon'; code: string; promotionKey: string; finalPrice: string }
  | { status: 'error'; code: string; reason: PromoErrorReason };

export interface PromoHook {
  state: PromoStatus;
  /** Apply a code (validates against backend + persists to localStorage). */
  applyCode: (code: string) => Promise<PromoStatus>;
  /** Drop the current code (clears localStorage + URL effect of next reload). */
  clearCode: () => void;
}

/**
 * Resolves a "promo code" from URL (?promo=XYZ) on mount, then
 * localStorage. Validates against the backend, polls every 30s for
 * active states (quota / expiry might change), and ticks 1Hz for the
 * countdown timer. The buyer can also `applyCode("STU-XYZ")` from the
 * Pricing card's coupon input — that overrides any URL/storage value.
 *
 * Same hook is used by both Hero (read-only, just shows a pill if
 * active) and Pricing (read-write, drives the price displayed +
 * collects manual codes).
 */
export function usePromotion(): PromoHook {
  const [code, setCode] = useState<string | null>(null);
  const [validation, setValidation] = useState<PromoValidation | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Mount: hydrate code from URL (?promo=XXX) first, then localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('promo')?.trim();
      if (fromUrl) {
        window.localStorage.setItem(STORAGE_KEY, fromUrl);
        setCode(fromUrl);
        return;
      }
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCode(stored);
    } catch {
      // localStorage may throw in private mode / blocked storage. Just skip.
    }
  }, []);

  // Re-validate whenever code changes; poll every 30s while a code is active.
  useEffect(() => {
    if (!code) {
      setValidation(null);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      const res = await validatePromo(code);
      if (!cancelled) setValidation(res);
    };
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code]);

  // 1Hz tick for the countdown — only when a quota-based promo is active.
  const needsTick =
    validation?.valid === true &&
    validation.kind === 'promotion' &&
    validation.validUntil != null;
  useEffect(() => {
    if (!needsTick) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [needsTick]);

  const applyCode = useCallback(async (next: string): Promise<PromoStatus> => {
    const trimmed = next.trim();
    if (!trimmed) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setCode(null);
      return { status: 'idle' };
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      /* ignore */
    }
    setCode(trimmed);
    // Validate immediately so the caller can react (show error toast etc.).
    // The effect above also re-validates — duplicate fetch is fine.
    const res = await validatePromo(trimmed);
    setValidation(res);
    return deriveStatus(trimmed, res, Date.now());
  }, []);

  const clearCode = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setCode(null);
    setValidation(null);
  }, []);

  const state = code ? deriveStatus(code, validation, now) : { status: 'idle' as const };
  return { state, applyCode, clearCode };
}

function deriveStatus(
  code: string,
  v: PromoValidation | null,
  now: number,
): PromoStatus {
  if (!v) return { status: 'pending', code };
  if (!v.valid) return { status: 'error', code, reason: v.reason };
  if (v.kind === 'coupon') {
    return {
      status: 'active_coupon',
      code,
      promotionKey: v.promotionKey,
      finalPrice: v.finalPrice,
    };
  }
  // kind === 'promotion'
  const remainingMs = v.validUntil != null ? Math.max(0, v.validUntil - now) : null;
  if (remainingMs === 0) return { status: 'error', code, reason: 'expired' };
  const remaining =
    v.maxUses != null ? Math.max(0, v.maxUses - v.usesCount) : null;
  return {
    status: 'active_promotion',
    code,
    key: v.key,
    finalPrice: v.finalPrice,
    maxUses: v.maxUses,
    usesCount: v.usesCount,
    remaining,
    validUntil: v.validUntil,
    remainingMs,
  };
}
