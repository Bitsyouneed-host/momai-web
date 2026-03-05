export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type BookingMethod = 'manual' | 'ai-call' | 'ai-sms';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: string;
  count?: number;
}

export interface Invitee {
  email: string;
  name?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Reminder {
  minutesBefore: number;
  type: 'push' | 'email';
  sent: boolean;
  sentAt?: string;
}

export interface Appointment {
  _id: string;
  user: string;
  title: string;
  description?: string;
  provider?: string;
  providerName?: string;
  providerPhone?: string;
  providerAddress?: string;
  category?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  timezone?: string;
  status: AppointmentStatus;
  bookingMethod: BookingMethod;
  isRecurring?: boolean;
  recurrence?: Recurrence;
  parentAppointment?: string;
  invitees?: Invitee[];
  reminders?: Reminder[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  title: string;
  description?: string;
  providerName?: string;
  providerPhone?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrence?: Recurrence;
  notes?: string;
}
