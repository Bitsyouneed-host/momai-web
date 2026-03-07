import { create } from 'zustand';
import type { User } from '../types/user';
import { usersApi } from '../api/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await usersApi.getMe();
      if (data.success && data.data) {
        // Backend returns { user: {...}, wallet: {...}, tokens: {...} }
        const responseData = data.data as unknown as Record<string, unknown>;
        const rawUser = (responseData.user || responseData) as Record<string, unknown>;
        const walletInfo = responseData.wallet as { address: string; chain: string; provider: string; isGenerated: boolean } | null;

        // Map backend user shape to our User type
        const user: User = {
          _id: (rawUser.id || rawUser._id) as string,
          email: rawUser.email as string | undefined,
          firstName: rawUser.firstName as string | undefined,
          lastName: rawUser.lastName as string | undefined,
          phone: rawUser.phone as string | undefined,
          dateOfBirth: rawUser.dateOfBirth as string | undefined,
          address: rawUser.address as User['address'],
          emergencyContact: rawUser.emergencyContact as User['emergencyContact'],
          insurance: rawUser.insurance as User['insurance'],
          authMethod: (rawUser.authMethod || 'email') as User['authMethod'],
          walletAddress: (rawUser.walletAddress || walletInfo?.address) as string | undefined,
          generatedWallet: walletInfo ? {
            provider: walletInfo.provider as 'local' | 'coinbase' | 'external',
            address: walletInfo.address,
            chain: walletInfo.chain,
          } : (rawUser.generatedWallet as User['generatedWallet']),
          subscription: rawUser.subscription as User['subscription'],
          isActive: (rawUser.isActive ?? true) as boolean,
          isProfileComplete: rawUser.isProfileComplete as boolean | undefined,
          createdAt: rawUser.createdAt as string,
          updatedAt: rawUser.updatedAt as string,
        };

        set({ user, isAuthenticated: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    set({ isAuthenticated: !!token });
  },
}));
