import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

// Based on auth_api.md - Adjusted to match backend response structure
export interface AuthData {
  access_token: string;
  refresh_token: string; // Backend sends snake_case
  user: User;
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
  private userKey = 'auth_user';
  private refreshTokenKey = 'refresh_token'; // Key used to store in localStorage (matches backend response)

  // access_token is stored in memory for better security (XSS)
  private accessToken: string | null = null;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getRefreshToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('AuthService: Resposta do login recebida:', response);
          // Access data from the 'data' property
          this.handleAuthentication(response.data.access_token, response.data.refresh_token, response.data.user);
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => console.log('Usuário registrado com sucesso:', response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)) // Ignore errors on logout, just clear session
    ).subscribe(() => {
      this.clearSession();
      this.router.navigate(['/auth/login']);
    });
  }

  refreshToken(): Observable<RefreshResponse> {
    const storedRefreshToken = this.getRefreshToken(); // Get the refresh token from localStorage
    if (!storedRefreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available.'));
    }

    // Send the refresh token with the key 'refresh_token' (snake_case) as expected by the backend
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refresh_token: storedRefreshToken }).pipe(
      tap(response => {
        console.log('AuthService: Resposta do refresh token recebida:', response);
        // Access data from the 'data' property
        this.handleAuthentication(response.data.access_token, response.data.refresh_token, response.data.user);
      }),
      catchError((error) => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    // Verifica se há um refresh token no localStorage para determinar se está autenticado
    // O access_token em memória pode ser nulo se a página for recarregada
    return !!this.getRefreshToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private handleAuthentication(accessToken: string, refreshToken: string, user: User): void {
    console.log('AuthService: Chamando handleAuthentication...');
    this.setTokens(accessToken, refreshToken);
    this.setUserData(user);
    console.log('AuthService: handleAuthentication concluído.');
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    console.log('AuthService: Salvando tokens. AccessToken (memória): ', accessToken ? 'presente' : 'ausente', '; RefreshToken (localStorage): ', refreshToken ? 'presente' : 'ausente');
    this.accessToken = accessToken;
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isAuthenticatedSubject.next(true);
    console.log('AuthService: Tokens salvos. RefreshToken no localStorage agora é:', localStorage.getItem(this.refreshTokenKey));
  }

  private setUserData(userData: User): void {
    console.log('AuthService: Salvando dados do usuário no localStorage:', userData);
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    console.log('AuthService: Dados do usuário salvos. Usuário no localStorage agora é:', localStorage.getItem(this.userKey));
  }

  public updateUserData(updatedData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      this.setUserData(newUser);
    }
  }

  public clearSession(): void {
    console.log('AuthService: Limpando sessão...');
    this.accessToken = null;
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('AuthService: Sessão limpa.');
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('AuthService: Erro ao parsear dados do usuário do localStorage:', error);
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
