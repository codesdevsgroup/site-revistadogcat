import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

/**
 * Componente para testar manualmente o fluxo de refresh token
 */
@Component({
  selector: 'app-test-refresh',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-8 mx-auto">
          <div class="card">
            <div class="card-header">
              <h3>Teste de Refresh Token</h3>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <h5>Status da Autenticação</h5>
                <p><strong>Autenticado:</strong> {{ isAuthenticated ? 'Sim' : 'Não' }}</p>
                <p><strong>Usuário:</strong> {{ currentUser?.name || 'Nenhum' }}</p>
                <p><strong>Role:</strong> {{ currentUser?.role || 'Nenhuma' }}</p>
                <p><strong>Tem Admin Access:</strong> {{ hasAdminAccess ? 'Sim' : 'Não' }}</p>
              </div>

              <div class="mb-3">
                <h5>Tokens</h5>
                <p><strong>Access Token:</strong> {{ accessToken ? 'Presente' : 'Ausente' }}</p>
                <p><strong>Refresh Token:</strong> {{ refreshToken ? 'Presente' : 'Ausente' }}</p>
              </div>

              <div class="mb-3">
                <h5>Testes</h5>
                <div class="d-grid gap-2">
                  <button class="btn btn-primary" (click)="testEnsureAuthenticated()">
                    Testar ensureAuthenticated()
                  </button>
                  <button class="btn btn-secondary" (click)="testCanRefreshToken()">
                    Testar canRefreshToken()
                  </button>
                  <button class="btn btn-warning" (click)="testRefreshToken()">
                    Testar refreshToken()
                  </button>
                  <button class="btn btn-info" (click)="navigateToProfile()">
                    Navegar para Perfil (AuthGuard)
                  </button>
                  <button class="btn btn-success" (click)="navigateToAdmin()">
                    Navegar para Admin (AdminGuard)
                  </button>
                  <button class="btn btn-danger" (click)="logout()">
                    Logout
                  </button>
                </div>
              </div>

              <div class="mb-3" *ngIf="testResults.length > 0">
                <h5>Resultados dos Testes</h5>
                <div class="alert" 
                     [ngClass]="result.success ? 'alert-success' : 'alert-danger'"
                     *ngFor="let result of testResults">
                  <strong>{{ result.test }}:</strong> {{ result.message }}
                  <small class="d-block text-muted">{{ result.timestamp | date:'medium' }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .alert {
      margin-bottom: 0.5rem;
    }
    .alert:last-child {
      margin-bottom: 0;
    }
  `]
})
export class TestRefreshComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  hasAdminAccess = false;
  accessToken: string | null = null;
  refreshToken: string | null = null;
  testResults: Array<{test: string, message: string, success: boolean, timestamp: Date}> = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateStatus();
  }

  updateStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.hasAdminAccess = this.authService.hasAdminAccess();
    this.accessToken = this.authService.getAccessToken();
    this.refreshToken = this.authService.getRefreshToken();
  }

  addTestResult(test: string, message: string, success: boolean) {
    this.testResults.unshift({
      test,
      message,
      success,
      timestamp: new Date()
    });
    
    // Manter apenas os últimos 10 resultados
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }

  testEnsureAuthenticated() {
    this.authService.ensureAuthenticated().subscribe({
      next: (result) => {
        this.addTestResult(
          'ensureAuthenticated()', 
          `Resultado: ${result}`, 
          result
        );
        this.updateStatus();
      },
      error: (error) => {
        this.addTestResult(
          'ensureAuthenticated()', 
          `Erro: ${error.message}`, 
          false
        );
        this.updateStatus();
      }
    });
  }

  testCanRefreshToken() {
    const canRefresh = this.authService.canRefreshToken();
    this.addTestResult(
      'canRefreshToken()', 
      `Pode fazer refresh: ${canRefresh}`, 
      canRefresh
    );
  }

  testRefreshToken() {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        this.addTestResult(
          'refreshToken()', 
          `Refresh bem-sucedido: ${response.message}`, 
          true
        );
        this.updateStatus();
      },
      error: (error) => {
        this.addTestResult(
          'refreshToken()', 
          `Erro no refresh: ${error.message}`, 
          false
        );
        this.updateStatus();
      }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/perfil']).then(success => {
      this.addTestResult(
        'Navegação para Perfil', 
        success ? 'Navegação bem-sucedida' : 'Falha na navegação', 
        success
      );
    });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']).then(success => {
      this.addTestResult(
        'Navegação para Admin', 
        success ? 'Navegação bem-sucedida' : 'Falha na navegação', 
        success
      );
    });
  }

  logout() {
    this.authService.logout();
    this.addTestResult('Logout', 'Logout realizado', true);
    this.updateStatus();
  }
}