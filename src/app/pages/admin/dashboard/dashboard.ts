import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RelatoriosModalComponent } from '../../../components/relatorios-modal/relatorios-modal';
import { UsuarioModalComponent } from '../../../components/usuario-modal/usuario-modal';
import { UsuarioService } from '../../../services/usuario.service';
import { NotificationService } from '../../../services/notification.service';
import { Usuario } from '../../../interfaces/usuario.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RelatoriosModalComponent, UsuarioModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('relatoriosModal') relatoriosModal!: RelatoriosModalComponent;
  @ViewChild('usuarioModal') usuarioModal!: UsuarioModalComponent;

  // Propriedades para controlar o modal de usuário
  isUsuarioModalVisible = false;
  selectedUsuario: Usuario | null = null;

  stats = [
    {
      title: 'Total de Usuários',
      value: '1,234',
      icon: 'fas fa-users',
      color: 'primary',
      change: '+12%'
    },
    {
      title: 'Artigos Publicados',
      value: '89',
      icon: 'fas fa-newspaper',
      color: 'success',
      change: '+5%'
    },
    {
      title: 'Assinantes Ativos',
      value: '567',
      icon: 'fas fa-crown',
      color: 'golden',
      change: '+8%'
    },
    {
      title: 'Visualizações',
      value: '12.5K',
      icon: 'fas fa-eye',
      color: 'info',
      change: '+15%'
    }
  ];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

  /**
   * Abre o modal de relatórios e exportações
   */
  abrirRelatorios(): void {
    this.relatoriosModal.abrir();
  }

  /**
   * Navega para a página de criação de novo artigo
   */
  novoArtigo(): void {
    this.router.navigate(['/admin/artigos/novo']);
  }

  /**
   * Abre o modal de adicionar usuário
   */
  adicionarUsuario(): void {
    this.selectedUsuario = null; // Garantir que é modo de criação
    this.isUsuarioModalVisible = true;
  }

  /**
   * Fecha o modal de usuário
   */
  fecharUsuarioModal(): void {
    this.isUsuarioModalVisible = false;
    this.selectedUsuario = null;
  }

  /**
   * Salva usuário (criar novo)
   */
  salvarUsuario(usuario: Usuario): void {
    this.usuarioService.createUser(usuario).subscribe({
      next: (novoUsuario) => {
        this.notificationService.success('Usuário criado com sucesso!');
        this.fecharUsuarioModal();
      },
      error: (error) => {
        console.error('Erro ao criar usuário:', error);
        this.notificationService.error('Erro ao criar usuário. Tente novamente.');
      }
    });
  }
}
