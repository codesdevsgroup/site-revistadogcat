import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Role, RoleUtils } from '../enums/role.enum';
import { LoginRequest, RegisterRequest, AuthData, LoginResponse, RefreshResponse } from '../dtos/auth.dto';
import { Usuario } from '../interfaces/usuario.interface';

// Tipagens movidas para src/app/dtos/auth.dto.ts e src/app/interfaces/usuario.interface.ts

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

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
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
    const accessToken = sessionStorage.getItem(this.accessTokenKey);

    // If an access token is present in sessionStorage, restore it to memory and set authenticated state to true
    if (accessToken) {
      this.accessToken = accessToken;
      this.isAuthenticatedSubject.next(true);
      console.log('AuthService: Access token restaurado do sessionStorage. Estado de autenticação: true');
    } else {
      // If no access token, assume not authenticated initially.
      // initializeAuth will handle refresh token logic.
      this.isAuthenticatedSubject.next(false);
      console.log('AuthService: Nenhum access token encontrado no sessionStorage. Estado de autenticação: false');
    }
  }

  private initializeAuth(): void {
    const refreshToken = this.getRefreshToken();
    const user = this.getUserFromStorage();

    if (refreshToken && user && !this.accessToken) {
      console.log('AuthService: Detectado refresh token após reload, verificando validade...');
      if (!user.userId || !user.email) {
        console.log('AuthService: Dados de usuário inválidos, limpando sessão.');
        this.clearSession();
        return;
      }

      console.log('AuthService: Adiando refresh do token até que seja necessário (rota protegida).');
    } else if (refreshToken && !user) {
      console.log('AuthService: Refresh token existe mas dados de usuário ausentes, limpando sessão.');
      this.clearSession();
    } else if (!refreshToken) {
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
    const refreshUrl = `${this.apiUrl}/refresh`;
    return this.http.post<RefreshResponse>(refreshUrl, { refresh_token: storedRefreshToken }).pipe(
      tap(response => {
        this.handleAuthentication(response.data.access_token, response.data.refresh_token, response.data.user);
      }),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.clearSession();
        } else {
          this.clearAccessToken();
          this.isAuthenticatedSubject.next(false);
        }
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): Usuario | null {
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

  private handleAuthentication(accessToken: string, refreshToken: string, user: Usuario): void {
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

  private setUserData(userData: Usuario): void {
    console.log('AuthService: Salvando dados do usuário no localStorage:', userData);
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    console.log('AuthService: Dados do usuário salvos. Usuário no localStorage agora é:', localStorage.getItem(this.userKey));
  }

  public updateUserData(updatedData: Partial<Usuario>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      this.setUserData(newUser);
    }
  }

  /**
   * Limpa apenas o access token (memória e sessionStorage)
   * Mantém o refresh token e dados do usuário
   */
  private clearAccessToken(): void {
    this.accessToken = null;
    sessionStorage.removeItem(this.accessTokenKey);
  }

  /**
   * Limpa toda a sessão (access token, refresh token e dados do usuário)
   */
  public clearSession(): void {
    this.accessToken = null;
    this.isLoggingOut = false; // Reset da flag de logout
    sessionStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr) as Usuario;
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
