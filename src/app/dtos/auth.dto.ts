// Tipagens relacionadas à autenticação e usuários (contratos de API)

export interface LoginRequest {
  identification: string; // email ou CPF
  password: string;
}

export interface RegisterRequest {
  userName: string;
  name: string;
  email: string;
  password: string;
  telefone?: string;
  cpf?: string;
}

// Dados de autenticação retornados pela API
export interface AuthData {
  access_token: string;
  refresh_token: string; // Backend envia snake_case
  user: import('../interfaces/usuario.interface').Usuario;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: AuthData;
  timestamp: string;
}

export interface RefreshResponse {
  statusCode: number;
  message: string;
  data: AuthData;
  timestamp: string;
}