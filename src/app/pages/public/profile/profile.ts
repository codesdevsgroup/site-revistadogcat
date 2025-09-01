import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { EnderecoService } from '../../../services/endereco.service';
import { ProfileService, UserProfile, UserDog } from '../../../services/profile.service';
import { Endereco } from '../../../interfaces/endereco.interface';
import { ProfileEditModalComponent } from '../../../components/profile-edit-modal/profile-edit-modal';
import { AddressModalComponent } from '../../../components/address-modal/address-modal';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileEditModalComponent, AddressModalComponent],
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

  // Controle dos Modais
  isProfileEditModalOpen = false;
  isAddressModalOpen = false;
  currentEditingAddress: Endereco | null = null;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private enderecoService: EnderecoService,
    private router: Router
  ) {}

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

    console.log('🔍 [ProfileComponent] Carregando dados para userId:', currentUser.userId);

    const dataSub = forkJoin({
      profile: this.profileService.getProfileData(),
      enderecos: this.enderecoService.getEnderecos(currentUser.userId)
    }).subscribe({
      next: ({ profile, enderecos }) => {
        console.log('✅ [ProfileComponent] Dados carregados com sucesso:');
        console.log('  - Profile:', profile);
        console.log('  - Endereços recebidos:', enderecos);
        console.log('  - Quantidade de endereços:', enderecos?.length || 0);

        this.user = profile.user;
        this.userDogs = profile.dogs || [];
        this.enderecos = enderecos.sort((a, b) => (b.principal ? 1 : -1));

        console.log('  - Endereços após ordenação:', this.enderecos);
        console.log('  - Array enderecos.length:', this.enderecos.length);

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [ProfileComponent] Erro ao carregar dados do perfil:', err);
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

  // --- Controle dos Modais ---

  // Modal de Edição de Perfil
  openProfileEditModal(): void {
    this.isProfileEditModalOpen = true;
  }

  closeProfileEditModal(): void {
    this.isProfileEditModalOpen = false;
  }

  onProfileUpdated(updatedUser: any): void {
    // Atualiza os dados do usuário localmente
    if (this.user) {
      this.user = { ...this.user, ...updatedUser };
    }
    // Recarrega os dados para garantir sincronização
    this.loadInitialData();
  }

  // Modal de Endereços
  openAddressModal(endereco?: Endereco): void {
    this.currentEditingAddress = endereco || null;
    this.isAddressModalOpen = true;
  }

  closeAddressModal(): void {
    this.isAddressModalOpen = false;
    this.currentEditingAddress = null;
  }

  onAddressSaved(savedAddress: Endereco): void {
    // Recarrega a lista de endereços
    const userId = this.authService.getCurrentUser()?.userId;
    if (userId) {
      this.loadEnderecos(userId);
    }
  }

  // --- Ações de Endereço ---

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



  // --- Ações do Perfil e Cães ---

  onEditProfile(): void {
    this.openProfileEditModal();
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

  // Método de debug para testar carregamento de endereços
  debugLoadEnderecos(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('🔧 [DEBUG] Usuário atual:', currentUser);

    if (!currentUser?.userId) {
      console.error('🔧 [DEBUG] Usuário não encontrado!');
      return;
    }

    console.log('🔧 [DEBUG] Forçando carregamento de endereços para userId:', currentUser.userId);

    this.enderecoService.getEnderecos(currentUser.userId).subscribe({
      next: (enderecos) => {
        console.log('🔧 [DEBUG] Endereços carregados:', enderecos);
        this.enderecos = enderecos;
      },
      error: (err) => {
        console.error('🔧 [DEBUG] Erro ao carregar endereços:', err);
      }
    });
  }
}
