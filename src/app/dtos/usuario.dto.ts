// Contratos de API relacionados a usuários
import type { Usuario } from '../interfaces/usuario.interface';

export interface PaginatedUsersResponse {
  statusCode: number;
  message: string;
  data: {
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}