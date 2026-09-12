export type Role = 'ROLE_ADMIN' | 'ROLE_STAFF' | 'ROLE_MEMBER';

export type BorrowStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface Item {
  id: number;
  title: string;
  isbn: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemRequest {
  title: string;
  isbn: string;
  author: string;
  category: string;
  totalCopies: number;
}

export interface UpdateItemRequest {
  title: string;
  author: string;
  category: string;
  totalCopies: number;
}

export interface BorrowRequest {
  memberId: number;
  itemId: number;
}

export interface BorrowRecord {
  id: number;
  itemId: number;
  itemTitle: string;
  itemIsbn: string;
  userId: number;
  userEmail: string;
  userName: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: BorrowStatus;
  fineAmount: number;
}

export interface AuditLog {
  id: number;
  actorId: number | null;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: number | null;
  details: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}
