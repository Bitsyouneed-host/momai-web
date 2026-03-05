import client from './client';
import type { APIResponse } from '../types/api';
import type { Provider } from '../types/provider';

export const providersApi = {
  list: (params?: { search?: string; category?: string; favorite?: boolean }) =>
    client.get<APIResponse<Provider[]>>('/providers', { params }),

  get: (id: string) =>
    client.get<APIResponse<Provider>>(`/providers/${id}`),

  create: (data: Partial<Provider>) =>
    client.post<APIResponse<Provider>>('/providers', data),

  update: (id: string, data: Partial<Provider>) =>
    client.put<APIResponse<Provider>>(`/providers/${id}`, data),

  toggleFavorite: (id: string) =>
    client.patch<APIResponse<Provider>>(`/providers/${id}/favorite`),

  delete: (id: string) =>
    client.delete<APIResponse<null>>(`/providers/${id}`),
};
