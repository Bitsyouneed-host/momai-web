import client from './client';
import type { APIResponse } from '../types/api';
import type { SearchResult, PlaceDetails } from '../types/search';

export const searchApi = {
  providers: (params: { query?: string; type?: string; lat?: number; lng?: number }) =>
    client.get<APIResponse<SearchResult[]>>('/search/providers', { params }),

  nearby: (params: { type: string; lat: number; lng: number; radius?: number }) =>
    client.get<APIResponse<SearchResult[]>>('/search/nearby', { params }),

  placeDetails: (placeId: string) =>
    client.get<APIResponse<PlaceDetails>>(`/search/provider/${placeId}`),
};
