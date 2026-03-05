export type PreferredContactMethod = 'call' | 'sms' | 'either';

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

export interface Provider {
  _id: string;
  user: string;
  name: string;
  businessType?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  website?: string;
  notes?: string;
  preferredContactMethod: PreferredContactMethod;
  operatingHours?: OperatingHours;
  category?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
