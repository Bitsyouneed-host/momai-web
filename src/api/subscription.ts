import client from './client';
import type { APIResponse } from '../types/api';
import type { SubscriptionInfo } from '../types/user';

export const subscriptionApi = {
  getStatus: () =>
    client.get<APIResponse<SubscriptionInfo>>('/subscription/status'),

  getTokenBalance: () =>
    client.get<APIResponse<{ balance: number; useTokenSystem: boolean }>>('/subscription/token-balance'),

  getCryptoPrice: () =>
    client.get<APIResponse<{ avaxPrice: number; updatedAt: string }>>('/subscription/crypto/price'),
};
