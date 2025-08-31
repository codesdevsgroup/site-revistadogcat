import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Role, RoleUtils } from '../enums/role.enum';

// --- Interfaces ---

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

export interface ApiResponse {
  statusCode: number;
  message: string;
  data?: any;
  timestamp: string;
}

export interface LoginResponse extends ApiResponse {
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
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
  active: boolean; // Garantindo que a propriedade existe
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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

  register(userData: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => console.log('Usuário registrado com sucesso:', response)),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token não encontrado'));
    }

    // Usando o novo endpoint específico para refresh token
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.setTokens(response.access_token, response.refresh_token);
        this.setUserData(response.user);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  private setUserData(userData: any): void {
    const user: User = {
      userId: userData.userId,
      userName: userData.userName,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: userData.avatarUrl,
      active: userData.active
    };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        this.clearSession();
        return null;
      }
    }
    return null;
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro na autenticação:', error);
    const errorMessage = error.error?.message || 'Erro de conexão com o servidor';
    return throwError(() => ({ message: errorMessage }));
  }

  hasAdminAccess(): boolean {
    const user = this.getCurrentUser();
    return user ? RoleUtils.hasAdminAccess(user.role) : false;
  }
}
