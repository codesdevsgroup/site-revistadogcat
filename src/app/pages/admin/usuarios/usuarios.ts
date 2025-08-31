import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UsuarioService, UserFilters } from '../../../services/usuario.service';
import { Usuario } from '../../../interfaces/usuario.interface';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { UsuarioModalComponent } from '../../../components/usuario-modal/usuario-modal';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsuarioModalComponent],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {
  public usuarios$: Observable<Usuario[]>;

  public searchControl = new FormControl('');
  public roleControl = new FormControl('');

  // Subject para disparar a atualização da lista
  private refreshUsers$ = new BehaviorSubject<void>(undefined);

  isModalVisible = false;
  selectedUsuario: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService
  ) {
    this.usuarios$ = new Observable<Usuario[]>();
  }

  ngOnInit(): void {
    const filters$ = combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.roleControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );

    // Combina os filtros com o gatilho de atualização
    this.usuarios$ = combineLatest([filters$, this.refreshUsers$]).pipe(
      switchMap(([[searchTerm, role]]) => {
        const filters: UserFilters = {
          search: searchTerm || undefined,
          role: role || undefined
        };
        return this.usuarioService.getUsers(filters).pipe(
          catchError(err => {
            this.notificationService.error('Falha ao carregar usuários.');
            return []; // Retorna um array vazio em caso de erro para não quebrar o template
          })
        );
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
    const operation$ = this.selectedUsuario
      ? this.usuarioService.updateUser(this.selectedUsuario.userId, usuario)
      : this.usuarioService.createUser(usuario);

    const successMessage = this.selectedUsuario
      ? 'Usuário atualizado com sucesso!'
      : 'Usuário criado com sucesso!';

    operation$.subscribe({
      next: () => {
        this.notificationService.success(successMessage);
        this.closeModal();
        this.refreshUsers$.next(); // Dispara a atualização da lista
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Ocorreu um erro ao salvar o usuário.');
      }
    });
  }

  excluirUsuario(usuario: Usuario): void {
    console.log('Excluir usuário:', usuario);
    // Lógica futura para exclusão com confirmação
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
