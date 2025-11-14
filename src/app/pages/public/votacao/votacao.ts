import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CadastroCaoService, CaoListItem } from '../../../services/cadastro-cao.service';
import { VotacaoService } from '../../../services/votacao.service';
import { AuthService } from '../../../services/auth.service';
import { LoginRequiredModalComponent } from '../components/login-required-modal/login-required-modal.component';
import { CreateVotoDto, VotoTipo } from '../../../interfaces/votacao.interface';
import { NotificationService } from '../../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-votacao',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginRequiredModalComponent],
  templateUrl: './votacao.html',
  styleUrls: ['./votacao.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VotacaoComponent implements OnInit, OnDestroy {
  @ViewChild(LoginRequiredModalComponent) loginModal?: LoginRequiredModalComponent;

  caes: CaoListItem[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cadastroCaoService: CadastroCaoService,
    private votacaoService: VotacaoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCaes();
  }

  loadCaes(): void {
    this.loading = true;
    this.cadastroCaoService
      .listar({ status: 'APROVADO', ativo: 'true' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.caes = result?.data || [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erro ao carregar cães para votação:', error);
          this.notificationService.error('Erro ao carregar lista de cães. Tente novamente mais tarde.');
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByCadastroId(index: number, item: CaoListItem): string {
    return item.cadastroCaoId;
  }

  onVotar(cadastroId: string, tipo: VotoTipo): void {
    if (!this.authService.isAuthenticated()) {
      this.loginModal?.show();
      return;
    }

    const payload: CreateVotoDto = { cadastroId, tipo };
    this.votacaoService.votar(payload).subscribe({
      next: () => {
        this.notificationService.success('Voto registrado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao votar:', err);
        const message = err?.error?.message || 'Não foi possível registrar seu voto.';
        this.notificationService.error(message);
      }
    });
  }
}