export type BookingStatus =
  | 'pending'
  | 'in-progress'
  | 'calling'
  | 'success'
  | 'failed'
  | 'completed'
  | 'cancelled'
  | 'no-answer'
  | 'voicemail'
  | 'callback';

export type ContactMethod = 'call' | 'sms';

export interface TranscriptEntry {
  role: 'ai' | 'human';
  text: string;
}

export interface BookingOutcome {
  success: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
}

export interface BookingAttempt {
  attemptedAt: string;
  method: ContactMethod;
  service: 'twilio' | 'retell';
  callId?: string;
  status: string;
  notes?: string;
}

export interface BookingRequest {
  _id: string;
  user: string;
  provider?: string;
  providerName: string;
  providerPhone: string;
  requestDetails?: string;
  preferredDates?: string[];
  serviceType?: string;
  estimatedDuration?: number;
  contactMethod: ContactMethod;
  status: BookingStatus;
  aiService?: 'twilio' | 'retell';
  aiCallId?: string;
  callSid?: string;
  aiTranscript?: string;
  transcript?: TranscriptEntry[];
  outcome?: BookingOutcome;
  bookedAppointment?: string;
  attempts?: BookingAttempt[];
  maxAttempts?: number;
  resultNotes?: string;
  tokenEscrowed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  providerName: string;
  providerPhone: string;
  requestDetails?: string;
  preferredDates?: string[];
  serviceType?: string;
  estimatedDuration?: number;
  contactMethod: ContactMethod;
}
