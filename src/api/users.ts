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
};
