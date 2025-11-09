import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, UserProfile } from '../../../services/profile.service';
import { CadastroCaoService, CadastroCao } from '../../../services/cadastro-cao.service';
import { Endereco } from '../../../interfaces/endereco.interface';
import { ProfileEditModalComponent } from '../../../components/profile-edit-modal/profile-edit-modal';
import { AddressModalComponent } from '../../../components/address-modal/address-modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ProfileEditModalComponent, AddressModalComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  loading = true;
  error = '';

  // Lista de cães do usuário
  dogs: CadastroCao[] = [];
  loadingDogs = true;
  dogsError = '';

  isProfileEditModalOpen = false;
  isAddressModalOpen = false;
  currentEditingAddress: Endereco | null = null;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private cadastroCaoService: CadastroCaoService
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

    const profileSub = this.profileService.getProfileData().subscribe({
      next: (profile) => {
        this.user = profile;
        this.loading = false;
        this.loadDogs();
      },
      error: (err) => {
        console.error('❌ [ProfileComponent] Erro ao carregar dados do perfil:', err);
        this.error = err.message || 'Erro ao carregar a página.';
        this.loading = false;
      }
    });

    this.subscriptions.add(profileSub);
  }

  openProfileEditModal(): void {
    this.isProfileEditModalOpen = true;
  }

  closeProfileEditModal(): void {
    this.isProfileEditModalOpen = false;
  }

  onProfileUpdated(updatedUser: UserProfile): void {
    if (this.user) {
      this.user = { ...this.user, ...updatedUser };
    }
    this.closeProfileEditModal();
    this.loadInitialData();
  }

  openAddressModal(endereco?: Endereco): void {
    this.currentEditingAddress = endereco || null;
    this.isAddressModalOpen = true;
  }

  closeAddressModal(): void {
    this.isAddressModalOpen = false;
    this.currentEditingAddress = null;
  }

  onAddressSaved(savedAddress: Endereco): void {
    const userId = this.authService.getCurrentUser()?.userId;
    this.closeAddressModal();
  }

  onEditProfile(): void {
    this.openProfileEditModal();
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

  // ----- Meus Cães -----
  private loadDogs(): void {
    this.loadingDogs = true;
    this.dogsError = '';
    const sub = this.cadastroCaoService.meusCadastros().subscribe({
      next: (list) => {
        this.dogs = list || [];
        this.loadingDogs = false;
      },
      error: (err) => {
        console.error('❌ [ProfileComponent] Erro ao listar meus cães:', err);
        this.dogsError = err.message || 'Erro ao carregar seus cadastros.';
        this.loadingDogs = false;
      }
    });
    this.subscriptions.add(sub);
  }

  // ----- Modal Enviar Vídeo -----
  isVideoModalOpen = false;
  selectedCadastro: CadastroCao | null = null;
  videoOption: 'UPLOAD' | 'URL' | 'WHATSAPP' | 'NONE' = 'NONE';
  selectedVideoFile: File | null = null;
  videoUrl: string = '';
  confirmaWhatsapp: boolean = false;
  isSubmittingVideo = false;
  videoError = '';

  openVideoModal(cadastro: CadastroCao): void {
    this.selectedCadastro = cadastro;
    // Pre-popula com opção atual, se existir
    const currentOption = (cadastro.videoOption as any) || 'NONE';
    // Normaliza para enum do backend
    const validOptions = ['UPLOAD', 'URL', 'WHATSAPP', 'NONE'];
    this.videoOption = validOptions.includes(currentOption) ? (currentOption as any) : 'NONE';
    this.videoUrl = cadastro.videoUrl || '';
    this.confirmaWhatsapp = !!cadastro.whatsappContato;
    this.selectedVideoFile = null;
    this.videoError = '';
    this.isVideoModalOpen = true;
  }

  closeVideoModal(): void {
    this.isVideoModalOpen = false;
    this.selectedCadastro = null;
    this.selectedVideoFile = null;
    this.videoUrl = '';
    this.confirmaWhatsapp = false;
    this.videoOption = 'NONE';
    this.videoError = '';
  }

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      // Validação simples de tipo
      if (!file.type.startsWith('video/')) {
        this.videoError = 'Selecione um arquivo de vídeo válido.';
        this.selectedVideoFile = null;
        return;
      }
      this.videoError = '';
      this.selectedVideoFile = file;
    }
  }

  submitVideo(): void {
    if (!this.selectedCadastro) return;
    this.videoError = '';
    this.isSubmittingVideo = true;
    const cadastroId = this.selectedCadastro.cadastroId;

    if (this.videoOption === 'UPLOAD') {
      if (!this.selectedVideoFile) {
        this.videoError = 'Por favor, selecione um arquivo de vídeo.';
        this.isSubmittingVideo = false;
        return;
      }
      const sub = this.cadastroCaoService.uploadVideo(cadastroId, this.selectedVideoFile).subscribe({
        next: (updated) => {
          this.updateLocalDog(updated);
          this.isSubmittingVideo = false;
          this.closeVideoModal();
          alert('Vídeo enviado com sucesso!');
        },
        error: (err) => {
          console.error('❌ Erro no upload de vídeo:', err);
          this.videoError = err.message || 'Falha ao enviar o vídeo.';
          this.isSubmittingVideo = false;
        }
      });
      this.subscriptions.add(sub);
      return;
    }

    if (this.videoOption === 'URL') {
      if (!this.videoUrl || !/^https?:\/\//i.test(this.videoUrl)) {
        this.videoError = 'Informe uma URL válida (ex.: link do YouTube).';
        this.isSubmittingVideo = false;
        return;
      }
      const sub = this.cadastroCaoService.updateVideoOption(cadastroId, { videoOption: 'URL', videoUrl: this.videoUrl }).subscribe({
        next: (updated) => {
          this.updateLocalDog(updated);
          this.isSubmittingVideo = false;
          this.closeVideoModal();
          alert('Link de vídeo atualizado com sucesso!');
        },
        error: (err) => {
          console.error('❌ Erro ao atualizar URL de vídeo:', err);
          this.videoError = err.message || 'Falha ao salvar a URL do vídeo.';
          this.isSubmittingVideo = false;
        }
      });
      this.subscriptions.add(sub);
      return;
    }

    if (this.videoOption === 'WHATSAPP') {
      if (!this.confirmaWhatsapp) {
        this.videoError = 'É necessário confirmar o envio via WhatsApp.';
        this.isSubmittingVideo = false;
        return;
      }
      const sub = this.cadastroCaoService.updateVideoOption(cadastroId, { videoOption: 'WHATSAPP' }).subscribe({
        next: (updated) => {
          this.updateLocalDog(updated);
          this.isSubmittingVideo = false;
          this.closeVideoModal();
          alert('Opção de envio via WhatsApp registrada!');
        },
        error: (err) => {
          console.error('❌ Erro ao definir WhatsApp:', err);
          this.videoError = err.message || 'Falha ao registrar a opção via WhatsApp.';
          this.isSubmittingVideo = false;
        }
      });
      this.subscriptions.add(sub);
      return;
    }

    // NONE: remover vídeo
    const sub = this.cadastroCaoService.updateVideoOption(cadastroId, { videoOption: 'NONE' }).subscribe({
      next: (updated) => {
        this.updateLocalDog(updated);
        this.isSubmittingVideo = false;
        this.closeVideoModal();
        alert('Informações de vídeo removidas.');
      },
      error: (err) => {
        console.error('❌ Erro ao limpar vídeo:', err);
        this.videoError = err.message || 'Falha ao remover as informações de vídeo.';
        this.isSubmittingVideo = false;
      }
    });
    this.subscriptions.add(sub);
  }

  private updateLocalDog(updated: CadastroCao): void {
    this.dogs = this.dogs.map((d) =>
      d.cadastroId === updated.cadastroId ? { ...d, ...updated } : d
    );
  }
}
