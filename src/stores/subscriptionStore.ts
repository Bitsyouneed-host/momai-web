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
        set({ subscription: data.data });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTokenBalance: async () => {
    try {
      const { data } = await subscriptionApi.getTokenBalance();
      if (data.success && data.data) {
        set({ tokenBalance: data.data.balance, useTokenSystem: data.data.useTokenSystem });
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
