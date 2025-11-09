import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RelatoriosModalComponent } from '../../../components/relatorios-modal/relatorios-modal';
import { UsuarioModalComponent } from '../../../components/usuario-modal/usuario-modal';
import { UsuarioService } from '../../../services/usuario.service';
import { NotificationService } from '../../../services/notification.service';
import { Usuario } from '../../../interfaces/usuario.interface';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RelatoriosModalComponent, UsuarioModalComponent, ButtonModule, CardModule, TooltipModule, TableModule, ChartModule],
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
      // Ícones PrimeIcons para visual mais moderno
      icon: 'pi pi-users',
      color: 'primary',
      change: '+12%'
    },
    {
      title: 'Artigos Publicados',
      value: '89',
      icon: 'pi pi-book',
      color: 'success',
      change: '+5%'
    },
    {
      title: 'Assinantes Ativos',
      value: '567',
      icon: 'pi pi-crown',
      color: 'golden',
      change: '+8%'
    },
    {
      title: 'Visualizações',
      value: '12.5K',
      icon: 'pi pi-eye',
      color: 'info',
      change: '+15%'
    }
  ];

  recentActivity = [
    { icon: 'pi pi-user', text: 'Novo usuário cadastrado: <strong>João Silva</strong>', time: '2 minutos atrás' },
    { icon: 'pi pi-newspaper', text: 'Artigo publicado: <strong>Cuidados com Pets no Inverno</strong>', time: '1 hora atrás' },
    { icon: 'pi pi-crown', text: 'Nova assinatura premium ativada', time: '3 horas atrás' }
  ];

  lineChartData: any;
  pieChartData: any;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.lineChartData = {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
      datasets: [
        {
          label: 'Usuários',
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: '#42A5F5',
          tension: .4
        }
      ]
    };

    this.pieChartData = {
      labels: ['Premium', 'Básico', 'Gratuito'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]
        }
      ]
    };
  }

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
