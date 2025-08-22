import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'editor' | 'leitor';
  status: 'ativo' | 'inativo';
  dataCadastro: string;
  ultimoAcesso: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      tipo: 'admin',
      status: 'ativo',
      dataCadastro: '2024-01-15',
      ultimoAcesso: '2024-12-20'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      tipo: 'editor',
      status: 'ativo',
      dataCadastro: '2024-02-10',
      ultimoAcesso: '2024-12-19'
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      tipo: 'leitor',
      status: 'ativo',
      dataCadastro: '2024-03-05',
      ultimoAcesso: '2024-12-18'
    },
    {
      id: 4,
      nome: 'Ana Costa',
      email: 'ana.costa@email.com',
      tipo: 'editor',
      status: 'inativo',
      dataCadastro: '2024-01-20',
      ultimoAcesso: '2024-11-15'
    },
    {
      id: 5,
      nome: 'Carlos Ferreira',
      email: 'carlos.ferreira@email.com',
      tipo: 'leitor',
      status: 'ativo',
      dataCadastro: '2024-04-12',
      ultimoAcesso: '2024-12-17'
    },
    {
      id: 6,
      nome: 'Lucia Mendes',
      email: 'lucia.mendes@email.com',
      tipo: 'admin',
      status: 'ativo',
      dataCadastro: '2024-01-08',
      ultimoAcesso: '2024-12-20'
    },
    {
      id: 7,
      nome: 'Roberto Lima',
      email: 'roberto.lima@email.com',
      tipo: 'leitor',
      status: 'ativo',
      dataCadastro: '2024-05-18',
      ultimoAcesso: '2024-12-16'
    },
    {
      id: 8,
      nome: 'Fernanda Rocha',
      email: 'fernanda.rocha@email.com',
      tipo: 'editor',
      status: 'ativo',
      dataCadastro: '2024-03-22',
      ultimoAcesso: '2024-12-19'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'admin': return 'badge-admin';
      case 'editor': return 'badge-editor';
      case 'leitor': return 'badge-leitor';
      default: return 'badge-default';
    }
  }

  getStatusClass(status: string): string {
    return status === 'ativo' ? 'status-ativo' : 'status-inativo';
  }

  editarUsuario(usuario: Usuario): void {
    console.log('Editar usuário:', usuario);
  }

  excluirUsuario(usuario: Usuario): void {
    console.log('Excluir usuário:', usuario);
  }

  trackByUserId(index: number, usuario: Usuario): number {
    return usuario.id;
  }

  getAdminCount(): number {
    return this.usuarios.filter(u => u.tipo === 'admin').length;
  }

  getActiveCount(): number {
    return this.usuarios.filter(u => u.status === 'ativo').length;
  }
}