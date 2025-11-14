export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  statusCode?: number;
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

