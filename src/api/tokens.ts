import client from './client';
import type { APIResponse } from '../types/api';

export interface TokenSpend {
  _id: string;
  userId: string;
  walletAddress?: string;
  txHash?: string;
  reason: 'call' | 'cancel' | 'reschedule';
  amount: number;
  chain?: string;
  providerName?: string;
  createdAt: string;
}

export const tokensApi = {
  getHistory: (params?: { page?: number; limit?: number }) =>
    client.get<APIResponse<TokenSpend[]>>('/tokens/history', { params }),

  getByTxHash: (txHash: string) =>
    client.get<APIResponse<TokenSpend>>(`/tokens/tx/${txHash}`),
};
