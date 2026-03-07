import { create } from 'zustand';
import type { SubscriptionInfo } from '../types/user';
import { subscriptionApi } from '../api/subscription';

interface SubscriptionState {
  subscription: SubscriptionInfo | null;
  tokenBalance: number;
  useTokenSystem: boolean;
  avaxPrice: number;
  isLoading: boolean;
  fetchStatus: () => Promise<void>;
  fetchTokenBalance: () => Promise<void>;
  fetchCryptoPrice: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  tokenBalance: 0,
  useTokenSystem: false,
  avaxPrice: 35,
  isLoading: false,

  fetchStatus: async () => {
    try {
      set({ isLoading: true });
      const { data } = await subscriptionApi.getStatus();
      if (data.success && data.data) {
        const raw = data.data as unknown as Record<string, unknown>;

        // Backend returns: { tier, status, paymentProvider, calls: { used, limit, bonus, remaining, resetDate }, tokens: { balance, useTokenSystem } }
        const calls = raw.calls as { used: number; limit: number; bonus: number; remaining: number; resetDate: string } | undefined;
        const tokens = raw.tokens as { balance: number; useTokenSystem: boolean } | undefined;

        const subscription: SubscriptionInfo = {
          tier: raw.tier as SubscriptionInfo['tier'],
          status: raw.status as SubscriptionInfo['status'],
          paymentProvider: raw.paymentProvider as SubscriptionInfo['paymentProvider'],
          callUsage: {
            used: calls?.used ?? 0,
            limit: calls?.limit ?? 0,
            bonusCalls: calls?.bonus ?? 0,
            resetDate: calls?.resetDate,
            remaining: calls?.remaining,
          },
          nft: raw.nft as SubscriptionInfo['nft'],
        };

        set({
          subscription,
          tokenBalance: tokens?.balance ?? 0,
          useTokenSystem: tokens?.useTokenSystem ?? false,
        });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  // Token balance is included in /status response, but we keep this method
  // for manual refresh. It re-fetches status.
  fetchTokenBalance: async () => {
    try {
      const { data } = await subscriptionApi.getStatus();
      if (data.success && data.data) {
        const raw = data.data as unknown as Record<string, unknown>;
        const tokens = raw.tokens as { balance: number; useTokenSystem: boolean } | undefined;
        set({
          tokenBalance: tokens?.balance ?? 0,
          useTokenSystem: tokens?.useTokenSystem ?? false,
        });
      }
    } catch {
      // ignore
    }
  },

  fetchCryptoPrice: async () => {
    try {
      const { data } = await subscriptionApi.getCryptoPrice();
      if (data.success && data.data) {
        set({ avaxPrice: data.data.avaxPrice });
      }
    } catch {
      // ignore
    }
  },
}));
