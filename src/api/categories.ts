import client from './client';
import type { APIResponse } from '../types/api';
import type { Category } from '../types/category';

export const categoriesApi = {
  list: () =>
    client.get<APIResponse<Category[]>>('/categories'),

  get: (id: string) =>
    client.get<APIResponse<Category>>(`/categories/${id}`),
};
