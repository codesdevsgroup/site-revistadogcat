import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DashboardService } from '../../../../services/dashboard.service';
import { NotificationService } from '../../../../services/notification.service';
import { DashboardData } from '../../../../interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './overview.html',
})
export class DashboardOverviewComponent implements OnInit {
  stats: { title: string; value: number | string; icon: string; color: 'primary' | 'success' | 'golden' | 'info'; change: string }[] = [];

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.stats = [
          {
            title: 'Total de Usuários',
            value: data.cards.totalUsuarios.value,
            icon: 'pi pi-users',
            color: 'primary',
            change: `${data.cards.totalUsuarios.percentage.toFixed(1)}%`
          },
          {
            title: 'Artigos Publicados',
            value: data.cards.artigosPublicados.value,
            icon: 'pi pi-book',
            color: 'success',
            change: `${data.cards.artigosPublicados.percentage.toFixed(1)}%`
          },
          {
            title: 'Assinantes Ativos',
            value: data.cards.assinantesAtivos.value,
            icon: 'pi pi-crown',
            color: 'golden',
            change: `${data.cards.assinantesAtivos.percentage.toFixed(1)}%`
          },
          {
            title: 'Visualizações',
            value: data.cards.visualizacoes.value,
            icon: 'pi pi-eye',
            color: 'info',
            change: `${data.cards.visualizacoes.percentage.toFixed(1)}%`
          }
        ];
      },
      error: (err: any) => {
        console.error('Erro ao carregar overview:', err);
        this.notificationService.error('Falha ao carregar visão geral do dashboard.');
      }
    });
  }
}
