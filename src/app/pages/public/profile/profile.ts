import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { EnderecoService } from '../../../services/endereco.service';
import { ProfileService, ProfileData, UserProfile, UserDog } from '../../../services/profile.service';
import { Endereco } from '../../../interfaces/endereco.interface';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Dados do Perfil
  user: UserProfile | null = null;
  userDogs: UserDog[] = [];
  enderecos: Endereco[] = [];
  loading = true;
  error = '';

  // Controle do Modal de Endereço
  isModalOpen = false;
  enderecoForm: FormGroup;
  currentEnderecoId: string | null = null;
  isCepLoading = false;
  cepStatus: 'none' | 'loading' | 'success' | 'error' = 'none';

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private enderecoService: EnderecoService,
    private validationService: ValidationService,
    private router: Router
  ) {
    this.enderecoForm = this.fb.group({
      tipo: ['RESIDENCIAL', Validators.required],
      nome: [''],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      pontoReferencia: [''],
      principal: [false]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadInitialData(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.userId) {
      this.error = 'Usuário não encontrado. Faça login novamente.';
      this.router.navigate(['/auth/login']);
      return;
    }

    const dataSub = forkJoin({
      profile: this.profileService.getProfileData(),
      enderecos: this.enderecoService.getEnderecos(currentUser.userId)
    }).subscribe({
      next: ({ profile, enderecos }) => {
        this.user = profile.user;
        this.userDogs = profile.dogs || [];
        this.enderecos = enderecos.sort((a, b) => (b.principal ? 1 : -1));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do perfil:', err);
        this.error = err.message || 'Erro ao carregar a página.';
        this.loading = false;
      }
    });

    this.subscriptions.add(dataSub);
  }

  private loadEnderecos(userId: string): void {
    const enderecosSub = this.enderecoService.getEnderecos(userId).subscribe({
      next: (enderecos) => {
        this.enderecos = enderecos.sort((a, b) => (b.principal ? 1 : -1));
      },
      error: (err) => {
        console.error('Erro ao recarregar endereços:', err);
        alert(err.message || 'Erro ao atualizar os endereços.');
      }
    });
    this.subscriptions.add(enderecosSub);
  }

  // --- Controle do Modal ---

  openModal(endereco?: Endereco): void {
    this.currentEnderecoId = endereco?.enderecoId || null;
    if (endereco) {
      this.enderecoForm.patchValue(endereco);
    } else {
      this.enderecoForm.reset({ tipo: 'RESIDENCIAL', principal: this.enderecos.length === 0 });
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.enderecoForm.reset();
    this.currentEnderecoId = null;
    this.cepStatus = 'none';
  }

  // --- Ações de Endereço ---

  saveEndereco(): void {
    if (this.enderecoForm.invalid) {
      this.enderecoForm.markAllAsTouched();
      return;
    }

    const userId = this.authService.getCurrentUser()?.userId;
    if (!userId) return;

    const formValue = this.enderecoForm.value;
    const action = this.currentEnderecoId
      ? this.enderecoService.updateEndereco(this.currentEnderecoId, formValue)
      : this.enderecoService.createEndereco(userId, formValue);

    const saveSub = action.subscribe({
      next: () => {
        this.loadEnderecos(userId);
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao salvar endereço:', err);
        alert(err.message || 'Não foi possível salvar o endereço.');
      }
    });
    this.subscriptions.add(saveSub);
  }

  deleteEndereco(enderecoId: string): void {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      const deleteSub = this.enderecoService.deleteEndereco(enderecoId).subscribe({
        next: () => {
          this.loadEnderecos(this.authService.getCurrentUser()?.userId!);
        },
        error: (err) => {
          console.error('Erro ao excluir endereço:', err);
          alert(err.message || 'Não foi possível excluir o endereço.');
        }
      });
      this.subscriptions.add(deleteSub);
    }
  }

  setPrincipal(enderecoId: string): void {
    const principalSub = this.enderecoService.setEnderecoPrincipal(enderecoId).subscribe({
      next: () => {
        this.loadEnderecos(this.authService.getCurrentUser()?.userId!);
      },
      error: (err) => {
        console.error('Erro ao definir endereço principal:', err);
        alert(err.message || 'Não foi possível definir o endereço como principal.');
      }
    });
    this.subscriptions.add(principalSub);
  }

  // --- Busca de CEP ---

  onCepChange(event: any): void {
    const cep = event.target.value;
    if (cep && cep.length === 9) { // Formato 00000-000
      this.isCepLoading = true;
      this.cepStatus = 'loading';
      const cepSub = this.enderecoService.buscarEnderecoPorCep(cep).subscribe({
        next: (data) => {
          this.enderecoForm.patchValue({
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado
          });
          this.isCepLoading = false;
          this.cepStatus = 'success';
        },
        error: (err) => {
          this.isCepLoading = false;
          this.cepStatus = 'error';
          console.error('Erro ao buscar CEP:', err);
        }
      });
      this.subscriptions.add(cepSub);
    }
  }

  formatCep(event: any): void {
    event.target.value = this.validationService.formatCep(event.target.value);
  }

  // --- Ações do Perfil e Cães ---

  onEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  onAddDog(): void {
    this.router.navigate(['/cadastro-cao']);
  }

  onEditDog(dogId: string): void {
    this.router.navigate(['/dog/edit', dogId]);
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'EDITOR': 'Editor',
      'FUNCIONARIO': 'Funcionário',
      'USER': 'Usuário'
    };
    return roleMap[role] || role;
  }
}
