import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../interfaces/usuario.interface';
import { Observable } from 'rxjs';
import { UsuarioModalComponent } from '../../../components/usuario-modal/usuario-modal';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, UsuarioModalComponent], // Adicionado o UsuarioModalComponent
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {
  public usuarios$: Observable<Usuario[]>;

  // Variáveis para controlar o modal
  isModalVisible = false;
  selectedUsuario: Usuario | null = null;

  constructor(private usuarioService: UsuarioService) {
    this.usuarios$ = this.usuarioService.getUsers();
  }

  ngOnInit(): void {}

  // --- Métodos de controle do Modal ---

  openModal(usuario?: Usuario): void {
    this.selectedUsuario = usuario || null;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedUsuario = null;
  }

  handleSave(usuario: Usuario): void {
    console.log('Dados recebidos do modal para salvar:', usuario);
    if (this.selectedUsuario) {
      // Lógica para ATUALIZAR usuário (chamar o serviço de update)
      console.log('Modo Edição');
    } else {
      // Lógica para CRIAR novo usuário (chamar o serviço de create)
      console.log('Modo Adição');
    }
    this.closeModal();
    // Futuramente, aqui devemos recarregar a lista de usuários
  }

  // --- Métodos existentes ---

  excluirUsuario(usuario: Usuario): void {
    console.log('Excluir usuário:', usuario);
    // Lógica para abrir um modal de confirmação e chamar o serviço de exclusão
  }

  trackByUserId(index: number, usuario: Usuario): string {
    return usuario.userId;
  }

  // --- Funções de estilo para o template ---

  getRoleClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'badge-admin',
      'EDITOR': 'badge-editor',
      'ASSINANTE': 'badge-assinante',
      'USUARIO_COMUM': 'badge-leitor',
      'DONO_PET_APROVADO': 'badge-dono-pet',
      'FUNCIONARIO': 'badge-funcionario'
    };
    return roleMap[role] || 'badge-default';
  }

  getStatusClass(active: boolean): string {
    return active ? 'status-ativo' : 'status-inativo';
  }
}
