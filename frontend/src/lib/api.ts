import {
  AuthResponse,
  User,
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  BorrowRequest,
  BorrowRecord,
  AuditLog,
  PageResponse,
  ApiError
} from '@/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '').replace(/\/api$/, '');

export class ApiResponseError extends Error {
  status: number;
  data: ApiError;

  constructor(status: number, data: ApiError) {
    super(data.message || 'API request failed');
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('libravault_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('libravault_token');
      localStorage.removeItem('libravault_user');
    }
    throw new ApiResponseError(response.status, data as ApiError);
  }

  return data as T;
}

export const api = {
  // Auth Endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { email: string; password: string; fullName: string }) =>
      request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request<User>('/api/auth/me'),
  },

  // Items Endpoints
  items: {
    getAll: (params?: { search?: string; category?: string; page?: number; size?: number; sortBy?: string; sortDirection?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category) query.append('category', params.category);
      if (params?.page !== undefined) query.append('page', params.page.toString());
      if (params?.size !== undefined) query.append('size', params.size.toString());
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.sortDirection) query.append('sortDirection', params.sortDirection);

      const qs = query.toString();
      return request<PageResponse<Item>>(`/api/items${qs ? `?${qs}` : ''}`);
    },
    getById: (id: number) => request<Item>(`/api/items/${id}`),
    create: (data: CreateItemRequest) =>
      request<Item>('/api/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateItemRequest) =>
      request<Item>(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/items/${id}`, {
        method: 'DELETE',
      }),
  },

  // Borrow Records Endpoints
  borrow: {
    issue: (data: BorrowRequest) =>
      request<BorrowRecord>('/api/borrow-records', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    returnItem: (recordId: number) =>
      request<BorrowRecord>(`/api/borrow-records/${recordId}/return`, {
        method: 'PUT',
      }),
    getMyHistory: (page = 0, size = 10) =>
      request<PageResponse<BorrowRecord>>(`/api/borrow-records/my-history?page=${page}&size=${size}`),
    getOverdue: (page = 0, size = 10) =>
      request<PageResponse<BorrowRecord>>(`/api/borrow-records/overdue?page=${page}&size=${size}`),
    getAll: (page = 0, size = 10) =>
      request<PageResponse<BorrowRecord>>(`/api/borrow-records?page=${page}&size=${size}`),
  },

  // Audit Logs Endpoints
  audit: {
    getAll: (params?: { targetType?: string; targetId?: number; page?: number; size?: number }) => {
      const query = new URLSearchParams();
      if (params?.targetType) query.append('targetType', params.targetType);
      if (params?.targetId) query.append('targetId', params.targetId.toString());
      if (params?.page !== undefined) query.append('page', params.page.toString());
      if (params?.size !== undefined) query.append('size', params.size.toString());

      const qs = query.toString();
      return request<PageResponse<AuditLog>>(`/api/audit-logs${qs ? `?${qs}` : ''}`);
    },
  },
};
