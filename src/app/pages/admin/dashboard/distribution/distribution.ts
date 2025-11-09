import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { DashboardService } from '../../../../services/dashboard.service';
import { NotificationService } from '../../../../services/notification.service';
import { DashboardResponse } from '../../../../interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard-distribution',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  templateUrl: './distribution.html',
  styleUrls: ['./distribution.scss']
})
export class DashboardDistributionComponent implements OnInit {
  pieChartData: any;

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.dashboardService.obterDashboard().subscribe({
      next: (data: DashboardResponse) => {
        const labels = data.userDistribution.map(u => u.role);
        const dataset = data.userDistribution.map(u => u.count);
        this.pieChartData = {
          labels,
          datasets: [
            {
              data: dataset,
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
              ],
              hoverBackgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
              ]
            }
          ]
        };
      },
      error: (err) => {
        console.error('Erro ao carregar distribuição:', err);
        this.notificationService.error('Falha ao carregar distribuição de usuários.');
      }
    });
  }
}
