import client from './client';
import type { APIResponse } from '../types/api';
import type { Appointment, CreateAppointmentPayload } from '../types/appointment';

export const appointmentsApi = {
  list: (params?: { startDate?: string; endDate?: string; status?: string }) =>
    client.get<APIResponse<Appointment[]>>('/appointments', { params }),

  get: (id: string) =>
    client.get<APIResponse<Appointment>>(`/appointments/${id}`),

  create: (data: CreateAppointmentPayload) =>
    client.post<APIResponse<Appointment>>('/appointments', data),

  update: (id: string, data: Partial<CreateAppointmentPayload>) =>
    client.put<APIResponse<Appointment>>(`/appointments/${id}`, data),

  cancel: (id: string) =>
    client.patch<APIResponse<Appointment>>(`/appointments/${id}/cancel`),

  delete: (id: string, deleteAll?: boolean) =>
    client.delete<APIResponse<null>>(`/appointments/${id}`, { params: { deleteAll } }),
};
