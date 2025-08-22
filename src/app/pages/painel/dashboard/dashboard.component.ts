import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
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

  constructor() {}

  ngOnInit(): void {}
}