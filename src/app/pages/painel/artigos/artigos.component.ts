import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Artigo {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  status: 'publicado' | 'rascunho' | 'revisao';
  dataPublicacao: string;
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  destaque: boolean;
  fotoDestaque?: string; // URL da foto de destaque
}

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artigos.component.html',
  styleUrls: ['./artigos.component.scss']
})
export class ArtigosComponent {
  artigos: Artigo[] = [
    {
      id: 1,
      titulo: 'Como Cuidar do Seu Cão no Inverno',
      autor: 'Dr. Maria Silva',
      categoria: 'Cuidados',
      status: 'publicado',
      dataPublicacao: '2024-01-15',
      visualizacoes: 1250,
      curtidas: 89,
      comentarios: 23,
      destaque: true,
      fotoDestaque: 'https://via.placeholder.com/400x240/2196F3/FFFFFF?text=Cuidados+Inverno'
    },
    {
      id: 2,
      titulo: 'Alimentação Balanceada para Gatos',
      autor: 'Dra. Ana Costa',
      categoria: 'Nutrição',
      status: 'publicado',
      dataPublicacao: '2024-01-12',
      visualizacoes: 980,
      curtidas: 67,
      comentarios: 15,
      destaque: false,
       fotoDestaque: 'https://via.placeholder.com/400x240/4CAF50/FFFFFF?text=Alimentação+Gatos'
     },
     {
      id: 3,
      titulo: 'Primeiros Socorros para Pets',
      autor: 'Dr. João Santos',
      categoria: 'Saúde',
      status: 'revisao',
      dataPublicacao: '2024-01-10',
      visualizacoes: 0,
      curtidas: 0,
      comentarios: 0,
      destaque: false,
      fotoDestaque: 'https://via.placeholder.com/400x240/FF9800/FFFFFF?text=Primeiros+Socorros'
    },
    {
      id: 4,
      titulo: 'Adestramento Positivo: Técnicas Eficazes',
      autor: 'Carlos Mendes',
      categoria: 'Comportamento',
      status: 'publicado',
      dataPublicacao: '2024-01-08',
      visualizacoes: 2100,
      curtidas: 156,
      comentarios: 42,
      destaque: true,
       fotoDestaque: 'https://via.placeholder.com/400x240/9C27B0/FFFFFF?text=Adestramento'
     },
     {
      id: 5,
      titulo: 'Vacinação: Calendário Completo',
      autor: 'Dra. Carla Ferreira',
      categoria: 'Saúde',
      status: 'publicado',
      dataPublicacao: '2024-01-05',
      visualizacoes: 1800,
      curtidas: 134,
      comentarios: 28,
      destaque: false,
      fotoDestaque: 'https://via.placeholder.com/400x240/E91E63/FFFFFF?text=Vacinação'
    },
    {
      id: 6,
      titulo: 'Brinquedos Seguros para Filhotes',
      autor: 'Marina Oliveira',
      categoria: 'Cuidados',
      status: 'rascunho',
      dataPublicacao: '2024-01-03',
      visualizacoes: 0,
      curtidas: 0,
      comentarios: 0,
      destaque: false
    },
    {
      id: 7,
      titulo: 'Sinais de Estresse em Animais',
      autor: 'Dr. Roberto Ferreira',
      categoria: 'Comportamento',
      status: 'publicado',
      dataPublicacao: '2024-01-01',
      visualizacoes: 1450,
      curtidas: 98,
      comentarios: 31,
      destaque: false
    },
    {
      id: 8,
      titulo: 'Higiene Dental em Pets',
      autor: 'Dra. Fernanda Rocha',
      categoria: 'Saúde',
      status: 'publicado',
      dataPublicacao: '2023-12-28',
      visualizacoes: 890,
      curtidas: 45,
      comentarios: 12,
      destaque: false
    },
    {
      id: 9,
      titulo: 'Exercícios para Cães Idosos',
      autor: 'Prof. Lucas Martins',
      categoria: 'Cuidados',
      status: 'revisao',
      dataPublicacao: '2023-12-25',
      visualizacoes: 0,
      curtidas: 0,
      comentarios: 0,
      destaque: false
    },
    {
      id: 10,
      titulo: 'Plantas Tóxicas para Animais',
      autor: 'Dra. Camila Souza',
      categoria: 'Segurança',
      status: 'publicado',
      dataPublicacao: '2023-12-22',
      visualizacoes: 3200,
      curtidas: 245,
      comentarios: 67,
      destaque: true
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'publicado':
        return 'status-publicado';
      case 'rascunho':
        return 'status-rascunho';
      case 'revisao':
        return 'status-revisao';
      default:
        return '';
    }
  }

  getCategoriaClass(categoria: string): string {
    switch (categoria.toLowerCase()) {
      case 'cuidados':
        return 'categoria-cuidados';
      case 'nutrição':
      case 'nutricao':
        return 'categoria-nutricao';
      case 'saúde':
      case 'saude':
        return 'categoria-saude';
      case 'comportamento':
        return 'categoria-comportamento';
      case 'segurança':
      case 'seguranca':
        return 'categoria-seguranca';
      default:
        return 'categoria-default';
    }
  }

  editarArtigo(artigo: Artigo): void {
    console.log('Editar artigo:', artigo);
  }

  excluirArtigo(artigo: Artigo): void {
    console.log('Excluir artigo:', artigo);
  }

  alterarDestaque(artigo: Artigo): void {
    artigo.destaque = !artigo.destaque;
    console.log('Alterar destaque:', artigo);
  }

  trackByArtigoId(index: number, artigo: Artigo): number {
    return artigo.id;
  }

  getPublishedCount(): number {
    return this.artigos.filter(a => a.status === 'publicado').length;
  }

  getFeaturedCount(): number {
    return this.artigos.filter(a => a.destaque).length;
  }

  getTotalViews(): number {
    return this.artigos.reduce((total, a) => total + a.visualizacoes, 0);
  }
}