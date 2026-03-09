import client from './client';
import type { APIResponse, } from '../types/api';
import type { User } from '../types/user';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User | null;
  requiresProfile?: boolean;
  isNewUser?: boolean;
}

interface EmailCodeData {
  message: string;
  requiresProfile?: boolean;
}

export const authApi = {
  sendEmailCode: (email: string) =>
    client.post<APIResponse<EmailCodeData>>('/auth/email/send-code', { email }),

  verifyEmailCode: (email: string, code: string) =>
    client.post<APIResponse<AuthTokens>>('/auth/email/verify-code', { email, code }),

  completeProfile: (firstName: string, lastName: string) =>
    client.post<APIResponse<User>>('/auth/email/complete-profile', { firstName, lastName }),

  walletLogin: (walletAddress: string) =>
    client.post<APIResponse<AuthTokens>>('/auth/wallet/login', { walletAddress }),

  walletTrialSendCode: (email: string) =>
    client.post<APIResponse<{ email: string; expiresIn?: number; alreadyVerified?: boolean }>>('/auth/wallet/trial/send-code', { email }),

  walletTrialVerifyCode: (code: string) =>
    client.post<APIResponse<{ verified: boolean; email?: string; freeTokenGranted?: boolean; tokensGranted?: number; gasSent?: string; alreadyVerified?: boolean }>>('/auth/wallet/trial/verify-code', { code }),

  refresh: (refreshToken: string) =>
    client.post<APIResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

  logout: () =>
    client.post<APIResponse<null>>('/auth/logout'),
};
