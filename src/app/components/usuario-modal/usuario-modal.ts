import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-modal.html',
  styleUrls: ['./usuario-modal.scss']
})
export class UsuarioModalComponent implements OnInit, OnChanges {
  @Input() usuario: Usuario | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Usuario>();

  usuarioForm: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      userId: [null],
      name: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['USUARIO_COMUM', Validators.required],
      active: [true, Validators.required],
      password: [''] // A lógica de validação da senha será tratada separadamente
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.isEditMode = true;
      this.usuarioForm.patchValue(this.usuario);
      // Senha não é obrigatória na edição
      this.usuarioForm.get('password')?.clearValidators();
    } else {
      this.isEditMode = false;
      this.usuarioForm.reset({ role: 'USUARIO_COMUM', active: true });
      // Senha é obrigatória na criação
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  onSave(): void {
    if (this.usuarioForm.valid) {
      this.save.emit(this.usuarioForm.value);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
