export interface ApiMetadata {
  method: string;
  responseAt: string;
  route: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  metadata: ApiMetadata;
}

export interface PaginatedData<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}
