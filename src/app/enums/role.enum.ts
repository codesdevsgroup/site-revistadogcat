/**
 * Enum que define as roles (níveis de acesso) do sistema
 * Baseado na documentação da API de usuários
 */
export enum Role {
  // Usuário básico da plataforma (padrão)
  USUARIO = 'USUARIO',
  
  // Dono de pet verificado na plataforma
  DONO_PET_APROVADO = 'DONO_PET_APROVADO',
  
  // Usuário com assinatura ativa da revista
  ASSINANTE = 'ASSINANTE',
  
  // Dono de pet aprovado com assinatura premium
  DONO_PET_APROVADO_ASSINANTE = 'DONO_PET_APROVADO_ASSINANTE',
  
  // Roles administrativas
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  FUNCIONARIO = 'FUNCIONARIO'
}

/**
 * Utilitário para verificar se uma role é administrativa
 */
export class RoleUtils {
  /**
   * Roles que têm acesso ao painel administrativo
   */
  static readonly ADMIN_ROLES: Role[] = [
    Role.ADMIN,
    Role.EDITOR,
    Role.FUNCIONARIO
  ];

  /**
   * Verifica se uma role é administrativa
   * @param role Role a ser verificada
   * @returns true se a role for administrativa
   */
  static isAdminRole(role: string | Role): boolean {
    return this.ADMIN_ROLES.includes(role as Role);
  }

  /**
   * Verifica se uma role tem acesso ao painel administrativo
   * @param role Role a ser verificada
   * @returns true se tem acesso ao painel
   */
  static hasAdminAccess(role: string | Role): boolean {
    return this.isAdminRole(role);
  }

  /**
   * Obtém a descrição de uma role
   * @param role Role para obter descrição
   * @returns Descrição da role
   */
  static getRoleDescription(role: string | Role): string {
    switch (role) {
      case Role.USUARIO:
        return 'Usuário básico da plataforma';
      case Role.DONO_PET_APROVADO:
        return 'Dono de pet verificado';
      case Role.ASSINANTE:
        return 'Assinante da revista';
      case Role.DONO_PET_APROVADO_ASSINANTE:
        return 'Dono de pet aprovado com assinatura premium';
      case Role.ADMIN:
        return 'Administrador do sistema';
      case Role.EDITOR:
        return 'Editor da revista';
      case Role.FUNCIONARIO:
        return 'Funcionário da revista';
      default:
        return 'Role desconhecida';
    }
  }
}