import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Role, RoleUtils } from '../enums/role.enum';

export interface LoginRequest {
  identification: string; // email ou CPF
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      userId: string;
      userName: string;
      name: string;
      email: string;
      role: string;
      avatarUrl?: string;
    };
  };
  timestamp: string;
}

export interface User {
  userId: string;
  userName: string;
  name: string;
  email: string;
  cpf?: string;
  telefone?: string;
  role: string;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'auth_user';
  
  // BehaviorSubject para gerenciar estado de autenticação
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.statusCode === 200 && response.data.access_token) {
            this.setTokens(response.data.access_token, response.data.refresh_token);
            this.setUserData(response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtém o token de autenticação
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtém o refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Obtém headers com token de autenticação
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole(role: string | Role): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Verifica se o usuário tem uma das roles especificadas
   */
  hasAnyRole(roles: (string | Role)[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role as Role) : false;
  }

  /**
   * Verifica se o usuário tem acesso administrativo
   */
  hasAdminAccess(): boolean {
    const user = this.getCurrentUser();
    return user ? RoleUtils.hasAdminAccess(user.role) : false;
  }

  /**
   * Verifica se o usuário tem role administrativa
   */
  isAdminRole(): boolean {
    const user = this.getCurrentUser();
    return user ? RoleUtils.isAdminRole(user.role) : false;
  }

  /**
   * Redireciona para login se não autenticado
   */
  redirectToLoginIfNotAuthenticated(): boolean {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }

  /**
   * Define tokens de acesso e refresh
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Define dados do usuário no localStorage
   */
  private setUserData(userData: any): void {
    const user: User = {
      userId: userData.userId,
      userName: userData.userName,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: userData.avatarUrl
    };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Define sessão do usuário (mantido para compatibilidade)
   */
  private setSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Limpa sessão do usuário
   */
  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Verifica se existe token válido
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;
    
    // Aqui você pode adicionar validação de expiração do token
    // Por exemplo, decodificar JWT e verificar exp
    return true;
  }

  /**
   * Obtém usuário do localStorage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error);
        this.clearSession();
      }
    }
    return null;
  }

  /**
   * Manipula erros de requisição
   */
  private handleError(error: any): Observable<never> {
    console.error('Erro na autenticação:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciais inválidas';
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão com o servidor';
    }
    
    return throwError(() => ({ message: errorMessage }));
  }
}