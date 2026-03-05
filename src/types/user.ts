export type SubscriptionTier = 'free' | 'pro' | 'pro_plus';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type PaymentProvider = 'apple' | 'crypto' | 'none';
export type AuthMethod = 'email' | 'wallet';

export interface CallUsage {
  used: number;
  limit: number;
  bonusCalls: number;
  resetDate?: string;
  remaining?: number;
  percentUsed?: number;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  paymentProvider: PaymentProvider;
  callUsage: CallUsage;
  nft?: {
    tokenId?: number;
    tier?: number;
    expiresAt?: string;
  };
}

export interface GeneratedWallet {
  provider: 'local' | 'coinbase' | 'external';
  address: string;
  chain: string;
}

export interface Insurance {
  hasInsurance: boolean;
  provider?: string;
  policyNumber?: string;
  groupNumber?: string;
  memberId?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface User {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  walletAddress?: string;
  generatedWallet?: GeneratedWallet;
  authMethod: AuthMethod;
  subscription?: SubscriptionInfo;
  insurance?: Insurance;
  isActive: boolean;
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}
