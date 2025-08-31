import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms'; // Importado
import { UsuarioService, UserFilters } from '../../../services/usuario.service';
import { Usuario } from '../../../interfaces/usuario.interface';
import { Observable, combineLatest } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UsuarioModalComponent } from '../../../components/usuario-modal/usuario-modal';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsuarioModalComponent], // Adicionado ReactiveFormsModule
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {
  public usuarios$: Observable<Usuario[]>;

  // Controles de formulário para os filtros
  public searchControl = new FormControl('');
  public roleControl = new FormControl('');

  isModalVisible = false;
  selectedUsuario: Usuario | null = null;

  constructor(private usuarioService: UsuarioService) {
    // Inicializa o observable, que será definido em ngOnInit
    this.usuarios$ = new Observable<Usuario[]>();
  }

  ngOnInit(): void {
    // Combina os valores dos dois filtros em um único observable
    const filters$ = combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.roleControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );

    // Usa switchMap para fazer a chamada à API com os filtros mais recentes
    this.usuarios$ = filters$.pipe(
      switchMap(([searchTerm, role]) => {
        const filters: UserFilters = {
          search: searchTerm || undefined,
          role: role || undefined
        };
        return this.usuarioService.getUsers(filters);
      })
    );
  }

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
    // Futuramente, aqui devemos recarregar a lista
    this.closeModal();
  }

  excluirUsuario(usuario: Usuario): void {
    console.log('Excluir usuário:', usuario);
  }

  trackByUserId(index: number, usuario: Usuario): string {
    return usuario.userId;
  }

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
