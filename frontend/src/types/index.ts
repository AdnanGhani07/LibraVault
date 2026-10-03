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
  expiresIn?: number;
  user?: User;
  id?: number;
  email?: string;
  fullName?: string;
  role?: Role;
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

// ============================================================================
// Discovery & AI Assistant Types
// ============================================================================

export interface ResearchPaper {
  arxivId: string;
  title: string;
  summary: string;
  authors: string[];
  publishedDate: string;
  updatedDate?: string;
  primaryCategory: string;
  categories: string[];
  pdfUrl: string;
  absUrl: string;
  doi?: string;
  journalRef?: string;
  bibtex?: string;
}

export interface PaperSearchResponse {
  query: string;
  category?: string;
  totalResults: number;
  page: number;
  size: number;
  papers: ResearchPaper[];
}

export interface GlobalBook {
  openLibraryKey: string;
  title: string;
  authors: string[];
  firstPublishYear?: number;
  isbn?: string;
  coverUrl?: string;
  editionCount: number;
  hasFullText: boolean;
  readUrl?: string;
}

export interface BookSearchResponse {
  query: string;
  totalResults: number;
  page: number;
  size: number;
  books: GlobalBook[];
}

export interface PaperSummaryRequest {
  arxivId?: string;
  title: string;
  abstractText: string;
}

export interface PaperSummary {
  arxivId?: string;
  title: string;
  oneSentenceSummary: string;
  coreProblem: string;
  methodology: string[];
  keyFindings: string[];
  practicalApplications: string[];
  provider: string;
}

export type ResourceType = 'RESEARCH_PAPER' | 'EXTERNAL_BOOK';

export interface SavedResource {
  id: number;
  resourceType: ResourceType;
  externalId: string;
  title: string;
  authors?: string;
  coverOrPdfUrl?: string;
  categoryOrYear?: string;
  notes?: string;
  createdAt: string;
}

export interface SaveResourceRequest {
  resourceType: ResourceType;
  externalId: string;
  title: string;
  authors?: string;
  coverOrPdfUrl?: string;
  categoryOrYear?: string;
  notes?: string;
}

