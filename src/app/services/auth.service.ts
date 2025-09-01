import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
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
  active: boolean;
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

  // Lógica para evitar múltiplas chamadas de refresh
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.statusCode === 200 && response.data.access_token) {
            this.handleAuthentication(response.data.access_token, response.data.refresh_token, response.data.user);
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

  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject;
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.isRefreshing = false;
      this.logout();
      return throwError(() => new Error('Refresh token não encontrado.'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.isRefreshing = false;
        this.setTokens(response.access_token, response.refresh_token);
        this.refreshTokenSubject.next(response.access_token);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.logout(); // Se o refresh token falhar, desloga o usuário
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Idealmente, chamar a API de logout para invalidar o token no backend
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)) // Ignora erros no logout
    ).subscribe(() => {
      this.clearSession();
      this.router.navigate(['/auth/login']);
    });
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

  private handleAuthentication(accessToken: string, refreshToken: string, user: User): void {
    this.setTokens(accessToken, refreshToken);
    this.setUserData(user);
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  private setUserData(userData: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  public updateUserData(updatedData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      this.setUserData(newUser);
    }
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
