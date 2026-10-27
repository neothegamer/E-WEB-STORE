import type { Api } from '@/api';
import { baseApi } from './baseApi';
import { adminApi } from './adminMock';

export const mockApi: Api = { ...baseApi, ...adminApi };
