import client from './client';
import type { APIResponse } from '../types/api';
import type { User } from '../types/user';

export const usersApi = {
  getMe: () =>
    client.get<APIResponse<User>>('/users/me'),

  updateMe: (data: Partial<User>) =>
    client.put<APIResponse<User>>('/users/me', data),

  updateNotificationSettings: (settings: Record<string, unknown>) =>
    client.put<APIResponse<User>>('/users/me/notifications', settings),

  changePassword: (currentPassword: string, newPassword: string) =>
    client.put<APIResponse<null>>('/users/me/password', { currentPassword, newPassword }),

  getWalletInfo: () =>
    client.get<APIResponse<{ address: string; chain: string; provider: string }>>('/users/me/wallet'),

  exportWalletSendCode: () =>
    client.post<APIResponse<{ email: string; expiresIn: number }>>('/users/me/wallet/export/send-code'),

  exportWalletVerifyCode: (code: string) =>
    client.post<APIResponse<{ address?: string; privateKey?: string; mnemonic?: string; chain?: string; warning?: string }>>('/users/me/wallet/export/verify-code', { code }),

  sendFundsSendCode: (data?: { tokenType?: string; amount?: string; to?: string }) =>
    client.post<APIResponse<{ email: string; expiresIn: number }>>('/users/me/wallet/send/send-code', data),

  sendFundsConfirm: (data: { code: string; to: string; tokenType: string; amount: string; tokenId?: number }) =>
    client.post<APIResponse<{ txHash: string; explorer: string }>>('/users/me/wallet/send/confirm', data),

  deleteAccount: () =>
    client.delete('/users/me'),
};
