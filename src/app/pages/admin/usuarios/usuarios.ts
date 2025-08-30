import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../interfaces/usuario.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {
  // Agora os usuários virão de um Observable do serviço
  public usuarios$: Observable<Usuario[]>;

  constructor(private usuarioService: UsuarioService) {
    this.usuarios$ = this.usuarioService.getUsers();
  }

  ngOnInit(): void {
    // A subscrição será feita no template com o pipe 'async'
  }

  getRoleClass(role: string): string {
    // Mapeia as roles da API para as classes CSS do template
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

  editarUsuario(usuario: Usuario): void {
    console.log('Editar usuário:', usuario);
    // Lógica para navegar para a página de edição, por exemplo:
    // this.router.navigate(['/admin/usuarios', usuario.userId]);
  }

  excluirUsuario(usuario: Usuario): void {
    console.log('Excluir usuário:', usuario);
    // Lógica para abrir um modal de confirmação e chamar o serviço de exclusão
  }

  trackByUserId(index: number, usuario: Usuario): string {
    return usuario.userId;
  }
}
