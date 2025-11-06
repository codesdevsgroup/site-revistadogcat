import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Usuario } from "../../interfaces/usuario.interface";
import { ValidationService } from "../../services/validation.service";
import { UsuarioService } from "../../services/usuario.service";
import { NotificationService } from "../../services/notification.service";

@Component({
  selector: "app-usuario-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./usuario-modal.html",
  styleUrls: ["./usuario-modal.scss"],
})
export class UsuarioModalComponent implements OnInit, OnChanges {
  @Input() usuario: Usuario | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Usuario>();
  @Output() userUnblocked = new EventEmitter<void>();

  usuarioForm: FormGroup;
  isEditMode = false;
  isUnblocking = false;

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private usuarioService: UsuarioService,
    private notificationService: NotificationService,
  ) {
    this.usuarioForm = this.fb.group({
      userId: [null],
      name: ["", Validators.required],
      userName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      cpf: ["", [this.validationService.cpfValidator()]], // Validação centralizada aplicada
      telefone: [""],
      role: ["USUARIO", Validators.required],
      active: [true, Validators.required],
      password: [""], // A lógica de validação da senha será tratada separadamente
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["usuario"] && this.usuario) {
      this.isEditMode = true;
      this.usuarioForm.patchValue(this.usuario);
      // Senha não é obrigatória na edição
      this.usuarioForm.get("password")?.clearValidators();
    } else {
      this.isEditMode = false;
      this.usuarioForm.reset({ role: "USUARIO", active: true });
      // Senha é obrigatória na criação
      this.usuarioForm
        .get("password")
        ?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.usuarioForm.get("password")?.updateValueAndValidity();
  }

  onSave(): void {
    if (this.usuarioForm.valid) {
      this.save.emit(this.usuarioForm.value);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onUnblockUser(): void {
    if (!this.usuario || !this.usuario.userId) return;

    if (confirm("Tem certeza que deseja desbloquear este usuário?")) {
      this.isUnblocking = true;
      this.usuarioService.unblockUser(this.usuario.userId).subscribe({
        next: (updatedUser) => {
          this.notificationService.success("Usuário desbloqueado com sucesso!");
          this.usuario = updatedUser;
          this.usuarioForm.patchValue(updatedUser);
          this.isUnblocking = false;
          this.userUnblocked.emit();
        },
        error: (err) => {
          this.notificationService.error(
            err.error?.message || "Erro ao desbloquear usuário.",
          );
          this.isUnblocking = false;
        },
      });
    }
  }

  isUserBlocked(): boolean {
    return this.usuario?.blocked === true;
  }

  getLoginAttemptsMessage(): string {
    if (!this.usuario) return "";
    const attempts = this.usuario.loginAttempts || 0;
    return attempts > 0 ? `Tentativas de login: ${attempts}` : "";
  }
}
