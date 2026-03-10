import client from './client';
import type { APIResponse } from '../types/api';
import type { BookingRequest, CreateBookingPayload } from '../types/booking';

export const bookingApi = {
  preCheck: () =>
    client.get<APIResponse<{ canBook: boolean; reason?: string; tokenBalance?: number }>>('/booking/pre-check'),

  create: (data: CreateBookingPayload) =>
    client.post<APIResponse<BookingRequest>>('/booking/request', data),

  list: (status?: string) =>
    client.get<APIResponse<BookingRequest[]>>('/booking/requests', { params: { status } }),

  get: (id: string) =>
    client.get<APIResponse<BookingRequest>>(`/booking/request/${id}`),

  approveEscrow: () =>
    client.post<APIResponse<{ txHash?: string }>>('/booking/approve-escrow'),

  cancel: (id: string) =>
    client.post<APIResponse<BookingRequest>>(`/booking/request/${id}/cancel`),

  reschedule: (id: string, data: { preferredDates: string[] }) =>
    client.post<APIResponse<BookingRequest>>(`/booking/request/${id}/reschedule`, data),
};
