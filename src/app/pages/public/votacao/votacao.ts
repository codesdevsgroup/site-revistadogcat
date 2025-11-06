import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CadastroCaoService, CaoListItem } from '../../../services/cadastro-cao.service';
import { VotacaoService } from '../../../services/votacao.service';
import { AuthService } from '../../../services/auth.service';
import { LoginRequiredModalComponent } from '../components/login-required-modal/login-required-modal.component';
import { CreateVotoDto, VotoTipo } from '../../../interfaces/votacao.interface';

@Component({
  selector: 'app-votacao',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginRequiredModalComponent],
  templateUrl: './votacao.html',
  styleUrls: ['./votacao.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VotacaoComponent implements OnInit {
  @ViewChild(LoginRequiredModalComponent) loginModal?: LoginRequiredModalComponent;

  caes: CaoListItem[] = [];
  loading = false;

  constructor(
    private cadastroCaoService: CadastroCaoService,
    private votacaoService: VotacaoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCaes();
  }

  async loadCaes(): Promise<void> {
    try {
      this.loading = true;
      const response = await this.cadastroCaoService.findAll();
      this.caes = response.data || [];
    } catch (error) {
      console.error('Erro ao carregar cães para votação:', error);
      alert('Erro ao carregar lista de cães. Tente novamente mais tarde.');
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  trackByCadastroId(index: number, item: CaoListItem): string {
    return item.cadastroCaoId;
  }

  onVotar(cadastroId: string, tipo: VotoTipo): void {
    // Exige login somente ao tentar votar
    if (!this.authService.isAuthenticated()) {
      this.loginModal?.show();
      return;
    }

    const payload: CreateVotoDto = { cadastroId, tipo };
    this.votacaoService.votar(payload).subscribe({
      next: () => {
        alert('Voto registrado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao votar:', err);
        const message = err?.error?.message || 'Não foi possível registrar seu voto.';
        alert(message);
      }
    });
  }
}