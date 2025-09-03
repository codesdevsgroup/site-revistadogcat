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
  private accessTokenKey = 'access_token'; // Key for sessionStorage

  // access_token is stored in memory for better security (XSS)
  private accessToken: string | null = null;

  // Flag para evitar múltiplas chamadas de logout simultâneas
  private isLoggingOut = false;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Inicializa o estado de autenticação de forma síncrona
    this.initializeAuthenticationState();
    // Agenda a inicialização para o próximo ciclo para evitar dependência circular
    setTimeout(() => this.initializeAuth(), 0);
  }

  private initializeAuthenticationState(): void {
    const refreshToken = this.getRefreshToken();
    const user = this.getUserFromStorage();
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    
    // Se há um access token no sessionStorage, restaura para a memória
    if (accessToken) {
      this.accessToken = accessToken;
      console.log('AuthService: Access token restaurado do sessionStorage.');
    }
    
    // Define o estado inicial baseado na presença de refresh token e dados válidos do usuário
    const hasValidSession = !!(refreshToken && user && user.userId && user.email);
    this.isAuthenticatedSubject.next(hasValidSession);
    
    console.log('AuthService: Estado inicial de autenticação:', hasValidSession);
  }

  private initializeAuth(): void {
    const refreshToken = this.getRefreshToken();
    const user = this.getUserFromStorage();
    
    if (refreshToken && user && !this.accessToken) {
      console.log('AuthService: Detectado refresh token após reload, verificando validade...');
      
      // Verifica se há dados de usuário válidos antes de tentar refresh
      if (!user.userId || !user.email) {
        console.log('AuthService: Dados de usuário inválidos, limpando sessão.');
        this.clearSession();
        return;
      }
      
      console.log('AuthService: Tentando recuperar access token...');
      this.refreshToken().subscribe({
        next: () => {
          console.log('AuthService: Token recuperado com sucesso após reload.');
          // Garante que o estado de autenticação seja atualizado
          this.isAuthenticatedSubject.next(true);
        },
        error: (error) => {
          console.log('AuthService: Falha ao recuperar token após reload:', error);
          // Se falhar, a sessão já foi limpa pelo método refreshToken
          // Redireciona para login se não estiver já na página de auth
          if (!this.router.url.includes('/auth/')) {
            this.router.navigate(['/auth/login']);
          }
        }
      });
    } else if (refreshToken && !user) {
      // Refresh token existe mas não há dados de usuário - sessão corrompida
      console.log('AuthService: Refresh token existe mas dados de usuário ausentes, limpando sessão.');
      this.clearSession();
    } else if (!refreshToken) {
      // Não há refresh token, garante que o estado seja false
      console.log('AuthService: Nenhum refresh token encontrado.');
      this.isAuthenticatedSubject.next(false);
    }
  }

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
    // Evita múltiplas chamadas de logout simultâneas
    if (this.isLoggingOut) {
      console.log('AuthService: Logout já em andamento, ignorando chamada duplicada.');
      return;
    }

    this.isLoggingOut = true;
    console.log('AuthService: Iniciando processo de logout...');

    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError((error) => {
        console.log('AuthService: Erro no logout do servidor (ignorado):', error);
        return of(null); // Ignore errors on logout, just clear session
      })
    ).subscribe(() => {
      console.log('AuthService: Limpando sessão e redirecionando...');
      this.clearSession();
      this.router.navigate(['/auth/login']);
      this.isLoggingOut = false;
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
        console.log('AuthService: Erro no refresh token, limpando sessão:', error);
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
    // Se já temos o token em memória, retorna
    if (this.accessToken) {
      return this.accessToken;
    }

    // Tenta recuperar do sessionStorage (persiste durante a sessão)
    const storedToken = sessionStorage.getItem(this.accessTokenKey);
    if (storedToken) {
      console.log('AuthService: Access token recuperado do sessionStorage.');
      this.accessToken = storedToken;
      return this.accessToken;
    }

    console.log('AuthService: Nenhum access token disponível.');
    return null;
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
    // Armazena o access token no sessionStorage para persistir durante a sessão
    sessionStorage.setItem(this.accessTokenKey, accessToken);
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
    this.isLoggingOut = false; // Reset da flag de logout
    sessionStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('AuthService: Sessão limpa e flags resetadas.');
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
