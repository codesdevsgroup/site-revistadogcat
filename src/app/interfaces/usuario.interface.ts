export interface Usuario {
  userId: string;
  userName: string;
  name: string;
  email: string;
  cpf?: string;
  telefone?: string;
  avatarUrl?: string;
  role: string;
  active: boolean;
  createdAt: string;
}
