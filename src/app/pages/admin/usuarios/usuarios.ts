import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormControl, Validators } from "@angular/forms";
import { UsuarioService } from "../../../services/usuario.service";
import { UserFilters } from "../../../dtos/usuario.dto";
import { Usuario } from "../../../interfaces/usuario.interface";
import { Observable, combineLatest, BehaviorSubject, Subject, of } from "rxjs";
import {
  startWith,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  takeUntil,
  tap,
} from "rxjs/operators";
import { UsuarioModalComponent } from "../../../components/usuario-modal/usuario-modal";
import { NotificationService } from "../../../services/notification.service";

@Component({
  selector: "app-usuarios",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsuarioModalComponent],
  templateUrl: "./usuarios.html",
  styleUrls: ["./usuarios.scss"],
})
export class UsuariosComponent implements OnInit, OnDestroy {
  public usuarios$: Observable<Usuario[]>;
  public isLoading = false;
  public errorMessage: string | null = null;

  public searchControl = new FormControl("");
  public roleControl = new FormControl("");

  // Subject para disparar a atualização da lista
  private refreshUsers$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>(); // Para gerenciar a desinscrição de observables

  isModalVisible = false;
  selectedUsuario: Usuario | null = null;

  // Password Change Logic
  isPasswordModalVisible = false;
  selectedUsuarioForPassword: Usuario | null = null;
  passwordControl = new FormControl("", [Validators.required, Validators.minLength(8)]);
  confirmPasswordControl = new FormControl("", [Validators.required]);
  passwordError: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService,
  ) {
    this.usuarios$ = new Observable<Usuario[]>(); // Inicializa para evitar problemas de undefined
  }

  ngOnInit(): void {
    const filters$ = combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(""),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$), // Garante a desinscrição
      ),
      this.roleControl.valueChanges.pipe(
        startWith(""),
        distinctUntilChanged(),
        takeUntil(this.destroy$), // Garante a desinscrição
      ),
    ]).pipe(
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
      ),
    );

    this.usuarios$ = combineLatest([filters$, this.refreshUsers$]).pipe(
      takeUntil(this.destroy$),
      switchMap(([[searchTerm, role]]) => {
        this.isLoading = true;
        this.errorMessage = null;
        const filters: UserFilters = {
          search: searchTerm || undefined,
          role: role || undefined,
        };
        return this.usuarioService.getUsers(filters).pipe(
          catchError((err) => {
            this.isLoading = false;
            const msg =
              err.error?.message ||
              "Falha ao carregar usuários. Verifique sua conexão ou tente novamente.";
            this.notificationService.error(msg);
            this.errorMessage = msg;
            return of([]);
          }),
          tap(() => {
            this.isLoading = false;
          }),
        );
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openModal(usuario?: Usuario): void {
    this.selectedUsuario = usuario || null;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedUsuario = null;
  }

  openPasswordModal(usuario: Usuario): void {
    this.selectedUsuarioForPassword = usuario;
    this.passwordControl.reset();
    this.confirmPasswordControl.reset();
    this.passwordError = null;
    this.isPasswordModalVisible = true;
  }

  closePasswordModal(): void {
    this.isPasswordModalVisible = false;
    this.selectedUsuarioForPassword = null;
    this.passwordControl.reset();
    this.confirmPasswordControl.reset();
  }

  submitPasswordChange(): void {
    if (this.passwordControl.invalid || this.confirmPasswordControl.invalid) {
        this.passwordError = "Por favor, preencha a senha corretamente (min. 8 caracteres).";
        return;
    }

    const pass = this.passwordControl.value;
    const confirm = this.confirmPasswordControl.value;

    if (pass !== confirm) {
        this.passwordError = "As senhas não coincidem.";
        return;
    }

    if (!this.selectedUsuarioForPassword) return;

    this.usuarioService.changePassword(this.selectedUsuarioForPassword.userId, pass!).subscribe({
        next: () => {
            this.notificationService.success("Senha alterada com sucesso!");
            this.closePasswordModal();
        },
        error: (err) => {
            this.passwordError = err.error?.message || "Erro ao alterar senha.";
            this.notificationService.error(this.passwordError!);
        }
    });
  }

  handleUserUnblocked(): void {
    this.notificationService.success("Usuário desbloqueado com sucesso!");
    this.refreshUsers$.next(undefined);
  }

  handleSave(usuario: Usuario): void {
    const operation$ = this.selectedUsuario
      ? this.usuarioService.updateUser(this.selectedUsuario.userId, usuario)
      : this.usuarioService.createUser(usuario);

    const successMessage = this.selectedUsuario
      ? "Usuário atualizado com sucesso!"
      : "Usuário criado com sucesso!";

    operation$.subscribe({
      next: () => {
        this.notificationService.success(successMessage);
        this.closeModal();
        this.refreshUsers$.next(undefined);
      },
      error: (err) => {
        this.notificationService.error(
          err.error?.message || "Ocorreu um erro ao salvar o usuário.",
        );
      },
    });
  }

  excluirUsuario(usuario: Usuario): void {
    console.log("Excluir usuário:", usuario);
    // Lógica futura para exclusão com confirmação
  }

  trackByUserId(index: number, usuario: Usuario): string {
    return usuario.userId;
  }

  getRoleClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      ADMIN: "badge-admin",
      EDITOR: "badge-editor",
      ASSINANTE: "badge-assinante",
      USUARIO: "badge-leitor",
      DONO_PET_APROVADO: "badge-dono-pet",
      FUNCIONARIO: "badge-funcionario",
      DONO_PET_APROVADO_ASSINANTE: "badge-dono-pet-assinante",
      JURADO: "badge-jurado",
    };
    return roleMap[role] || "badge-default";
  }

  getStatusClass(active: boolean): string {
    return active ? "status-ativo" : "status-inativo";
  }
}
