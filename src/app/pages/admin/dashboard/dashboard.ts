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
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardResponse } from '../../../dtos/dashboard.dto';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RelatoriosModalComponent, UsuarioModalComponent, ButtonModule, CardModule, TooltipModule, TableModule, ChartModule, SkeletonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('relatoriosModal') relatoriosModal!: RelatoriosModalComponent;
  @ViewChild('usuarioModal') usuarioModal!: UsuarioModalComponent;

  // Propriedades para controlar o modal de usuário
  isUsuarioModalVisible = false;
  selectedUsuario: Usuario | null = null;

  stats: Array<{ title: string; value: string; icon: string; color: string; change: string; changePositive: boolean }> = [];
  isLoading = true;

  recentActivity = [
    { icon: 'person_add', text: 'Novo usuário cadastrado: <strong>João Silva</strong>', time: '2 minutos atrás' },
    { icon: 'description', text: 'Artigo publicado: <strong>Cuidados com Pets no Inverno</strong>', time: '1 hora atrás' },
    { icon: 'emoji_events', text: 'Nova assinatura premium ativada', time: '3 horas atrás' }
  ];

  lineChartData: any;
  pieChartData: any;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private notificationService: NotificationService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  /**
   * Carrega dados do dashboard da API e popula os cards e gráficos.
   */
  private loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardResponse) => {
        this.populateStats(data);
        this.populateCharts(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard:', error);
        this.notificationService.error('Não foi possível carregar os dados do dashboard.');
        // Mantém a página funcional com dados vazios
        this.stats = [];
        this.lineChartData = { labels: [], datasets: [] };
        this.pieChartData = { labels: [], datasets: [] };
        this.isLoading = false;
      }
    });
  }

  /**
   * Popula os cards de estatísticas com base nos dados da API
   */
  private populateStats(data: DashboardResponse): void {
    // Falhas de contrato da API: proteger contra ausência de 'cards'
    if (!data || !data.cards) {
      this.stats = [];
      this.notificationService.warning('Dados dos cards ausentes na resposta do dashboard.');
      return;
    }

    const formatNumber = (n: number) => n.toLocaleString('pt-BR');

    const cards = data.cards;
    this.stats = [
      {
        title: 'Total de Usuários',
        value: formatNumber(cards.totalUsuarios.value),
        icon: 'group',
        color: 'primary',
        change: `${cards.totalUsuarios.percentage > 0 ? '+' : ''}${cards.totalUsuarios.percentage}%`,
        changePositive: cards.totalUsuarios.percentage >= 0
      },
      {
        title: 'Artigos Publicados',
        value: formatNumber(cards.artigosPublicados.value),
        icon: 'article',
        color: 'success',
        change: `${cards.artigosPublicados.percentage > 0 ? '+' : ''}${cards.artigosPublicados.percentage}%`,
        changePositive: cards.artigosPublicados.percentage >= 0
      },
      {
        title: 'Assinantes Ativos',
        value: formatNumber(cards.assinantesAtivos.value),
        icon: 'emoji_events',
        color: 'golden',
        change: `${cards.assinantesAtivos.percentage > 0 ? '+' : ''}${cards.assinantesAtivos.percentage}%`,
        changePositive: cards.assinantesAtivos.percentage >= 0
      },
      {
        title: 'Visualizações',
        value: formatNumber(cards.visualizacoes.value),
        icon: 'visibility',
        color: 'info',
        change: `${cards.visualizacoes.percentage > 0 ? '+' : ''}${cards.visualizacoes.percentage}%`,
        changePositive: cards.visualizacoes.percentage >= 0
      }
    ];

    // Card adicional: Cães cadastrados (total), com variação mensal
    const dogsMonthly = Array.isArray(data?.dogsStats?.monthlyGrowth) ? data!.dogsStats!.monthlyGrowth : [];
    const last = dogsMonthly.length >= 1 ? dogsMonthly[dogsMonthly.length - 1].count : 0;
    const prev = dogsMonthly.length >= 2 ? dogsMonthly[dogsMonthly.length - 2].count : 0;
    const diff = last - prev;
    const perc = prev > 0 ? Math.round((diff / prev) * 100) : 0;
    const dogsTotal = data?.dogsStats?.totalCount ?? 0;
    this.stats.push({
      title: 'Cães Cadastrados',
      value: formatNumber(dogsTotal),
      icon: 'pets',
      color: 'success',
      change: `${perc > 0 ? '+' : ''}${perc}%`,
      changePositive: perc >= 0,
    });
  }

  /**
   * Popula os gráficos de linha (crescimento mensal) e pizza (distribuição de usuários)
   */
  private populateCharts(data: DashboardResponse): void {
    // Proteger contra arrays ausentes na resposta
    const monthlyGrowth = Array.isArray(data?.monthlyGrowth) ? data.monthlyGrowth : [];
    const userDistribution = Array.isArray(data?.userDistribution) ? data.userDistribution : [];

    // Gráfico de Crescimento Mensal
    const growthLabels = monthlyGrowth.map(m => m.month);
    const growthCounts = monthlyGrowth.map(m => m.count);
    this.lineChartData = {
      labels: growthLabels,
      datasets: [
        {
          label: 'Novos Usuários',
          data: growthCounts,
          fill: false,
          borderColor: '#42A5F5',
          tension: .4
        }
      ]
    };

    // Gráfico de Cadastro de Cães + informativo de incompletos
    const dogsMonthly = Array.isArray(data?.dogsStats?.monthlyGrowth) ? data!.dogsStats!.monthlyGrowth : [];
    const dogsLabels = dogsMonthly.map(m => m.month);
    const dogsCounts = dogsMonthly.map(m => m.count);
    this.dogsLineChartData = {
      labels: dogsLabels,
      datasets: [
        {
          label: 'Cadastros de Cães',
          data: dogsCounts,
          fill: false,
          borderColor: '#10B981',
          tension: .4
        }
      ]
    };
    this.dogsIncompleteCount = data?.dogsStats?.incompleteCount ?? 0;

    // Gráfico de Distribuição de Usuários
    const labelMap: Record<string, string> = {
      USUARIO: 'Usuários',
      ASSINANTE: 'Assinantes',
      ADMIN: 'Admins'
    };
    const distLabels = userDistribution.map(u => labelMap[u.role] ?? u.role);
    const distCounts = userDistribution.map(u => u.count);
    this.pieChartData = {
      labels: distLabels,
      datasets: [
        {
          data: distCounts,
          backgroundColor: [
            '#42A5F5', // azul
            '#66BB6A', // verde
            '#FFA726'  // laranja
          ],
          hoverBackgroundColor: [
            '#64B5F6',
            '#81C784',
            '#FFB74D'
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

  // Novos estados para o terceiro card
  dogsLineChartData: any;
  dogsIncompleteCount: number = 0;
}
