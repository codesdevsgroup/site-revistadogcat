import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../components/footer/footer';
import { SocialMediaService } from '../../../services/social-media.service';
import { CaoService } from '../../../services/cao.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { 
  Cao, 
  ProprietarioCao, 
  CadastroCaoPayload, 
  VideoOption,
  SexoCao,
  RACAS_CAO
} from '../../../interfaces/cao.interface';

@Component({
  selector: 'app-cadastro-cao',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './cadastro-cao.html',
  styleUrl: './cadastro-cao.scss'
})
export class CadastroCaoComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  socialMedia: any;

  currentStep = 1;
  videoOption: VideoOption = 'upload';
  proprietarioDiferente = false; // Nova propriedade para controlar se o proprietário é diferente
  userForm: FormGroup;
  dogForm: FormGroup;
  videoForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isCepLoading = false;
  cepStatus: 'none' | 'loading' | 'success' | 'error' = 'none';
  
  // Dados do usuário logado obtidos do AuthService
  usuarioLogado: any = null;
  
  // Propriedades para fotos obrigatórias
  fotoPerfil: File | null = null;
  fotoLateral: File | null = null;
  fotoPerfilPreview: string | null = null;
  fotoLateralPreview: string | null = null;
  
  // Propriedades para pedigree
  temPedigree: boolean = false;
  pedigreeFrente: File | null = null;
  pedigreeVerso: File | null = null;
  
  // Propriedades para microchip
  temMicrochip: boolean = false;
  numeroMicrochip: string = '';

  constructor(
    private fb: FormBuilder,
    private socialMediaService: SocialMediaService,
    private caoService: CaoService,
    private authService: AuthService,
    private validationService: ValidationService
  ) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
    this.userForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      endereco: [''],
      cep: [''],
      cidade: [''],
      estado: ['']
    });
    
    // Preencher automaticamente com dados do usuário logado
    this.preencherDadosUsuarioLogado();

    this.dogForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      raca: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      peso: [''],
      altura: [''],
      registroPedigree: ['', [Validators.required]],
      microchip: [''],
      numeroMicrochip: [''],
      nomePai: [''],
      nomeMae: [''],
      titulos: [''],
      caracteristicas: ['']
    });

    this.videoForm = this.fb.group({
      videoUrl: [''],
      confirmaWhatsapp: [false],
      observacoes: ['']
    });
  }

  // Método para alternar entre proprietário diferente ou mesmo usuário logado
  toggleProprietarioDiferente() {
    this.proprietarioDiferente = !this.proprietarioDiferente;
    
    if (this.proprietarioDiferente) {
      // Limpar campos para permitir entrada manual
      this.limparDadosProprietario();
      // Habilitar validações para campos obrigatórios
      this.habilitarValidacoesProprietario();
    } else {
      // Preencher com dados do usuário logado
      this.preencherDadosUsuarioLogado();
      // Desabilitar validações já que os dados vêm do usuário logado
      this.desabilitarValidacoesProprietario();
    }
  }

  // Preencher formulário com dados do usuário logado
  preencherDadosUsuarioLogado() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioLogado = user;
      this.userForm.patchValue({
        nomeCompleto: user.name || '',
        cpf: user.cpf || '',
        email: user.email || '',
        telefone: user.telefone || '',
        // Campos de endereço podem ser preenchidos se disponíveis no perfil do usuário
        endereco: '',
        cep: '',
        cidade: '',
        estado: ''
      });
    }
  }

  // Limpar dados do proprietário para entrada manual
  limparDadosProprietario() {
    this.userForm.patchValue({
      nomeCompleto: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      cep: '',
      cidade: '',
      estado: ''
    });
  }

  // Habilitar validações quando proprietário é diferente
  habilitarValidacoesProprietario() {
    this.userForm.get('nomeCompleto')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.userForm.get('cpf')?.setValidators([Validators.required]);
    this.userForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.userForm.get('telefone')?.setValidators([Validators.required]);
    this.userForm.updateValueAndValidity();
  }

  // Desabilitar validações quando usar dados do usuário logado
  desabilitarValidacoesProprietario() {
    this.userForm.get('nomeCompleto')?.clearValidators();
    this.userForm.get('cpf')?.clearValidators();
    this.userForm.get('email')?.clearValidators();
    this.userForm.get('telefone')?.clearValidators();
    this.userForm.updateValueAndValidity();
  }

  get racasCao() { return RACAS_CAO; }

  // Métodos para fotos
  onFotoPerfilSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      this.fotoPerfil = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.fotoPerfilPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  onFotoLateralSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      this.fotoLateral = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.fotoLateralPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  removeFotoPerfil(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoPerfil = null;
    this.fotoPerfilPreview = null;
    const input = document.getElementById('fotoPerfil') as HTMLInputElement;
    if (input) input.value = '';
  }

  removeFotoLateral(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoLateral = null;
    this.fotoLateralPreview = null;
    const input = document.getElementById('fotoLateral') as HTMLInputElement;
    if (input) input.value = '';
  }

  // Métodos para pedigree
  onTemPedigreeChange(event: any) {
    this.temPedigree = event.target.checked;
    const control = this.dogForm.get('registroPedigree');
    if (this.temPedigree) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
      this.pedigreeFrente = this.pedigreeVerso = null;
    }
    control?.updateValueAndValidity();
  }

  onPedigreeFrenteSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      this.pedigreeFrente = file;
    }
  }

  onPedigreeVersoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      this.pedigreeVerso = file;
    }
  }

  // Métodos para microchip
  onTemMicrochipChange(event: any) {
    this.temMicrochip = event.target.checked;
    const control = this.dogForm.get('numeroMicrochip');
    if (this.temMicrochip) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
      this.numeroMicrochip = '';
    }
    control?.updateValueAndValidity();
  }

  selectVideoOption(option: 'upload' | 'youtube' | 'whatsapp') {
    this.videoOption = option;
    
    // Reset form validations based on selected option
    const videoUrlControl = this.videoForm.get('videoUrl');
    const confirmaWhatsappControl = this.videoForm.get('confirmaWhatsapp');
    
    // Clear previous validations
    videoUrlControl?.clearValidators();
    confirmaWhatsappControl?.clearValidators();
    
    // Set validations based on option
    if (option === 'youtube') {
      videoUrlControl?.setValidators([Validators.required]);
    } else if (option === 'whatsapp') {
      confirmaWhatsappControl?.setValidators([Validators.requiredTrue]);
    }
    
    // Update form validity
    videoUrlControl?.updateValueAndValidity();
    confirmaWhatsappControl?.updateValueAndValidity();
    
    // Clear file if switching from upload
    if (option !== 'upload') {
      this.removeFile();
    }
  }

  nextStep() { if (this.currentStep < 4) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }
  triggerFileInput() { this.fileInput.nativeElement.click(); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validation = this.validationService.validateVideoFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      if (validation.warning && !window.confirm(validation.warning)) {
        return;
      }
      this.selectedFile = file;
      this.simulateUpload();
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.fileInput.nativeElement.value = '';
  }

  simulateUpload() {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) clearInterval(interval);
    }, 200);
  }

  formatFileSize(bytes: number): string {
    return this.validationService.formatFileSize(bytes);
  }

  isFormValid(): boolean {
    // Validar dados do proprietário apenas se for diferente do usuário logado
    const userValid = this.proprietarioDiferente ? this.userForm.valid : true;
    const dogValid = this.dogForm.valid;
    
    // Validar fotos obrigatórias
    const fotosValid = this.fotoPerfil !== null && this.fotoLateral !== null;
    
    let videoValid = false;
    
    switch (this.videoOption) {
      case 'upload':
        videoValid = this.selectedFile !== null;
        break;
      case 'youtube':
        videoValid = this.videoForm.get('videoUrl')?.valid || false;
        break;
      case 'whatsapp':
        videoValid = this.videoForm.get('confirmaWhatsapp')?.value === true;
        break;
    }
    
    // Validar pedigree se selecionado
    if (this.temPedigree) {
      const registroPedigree = this.dogForm.get('registroPedigree')?.value;
      if (!registroPedigree || !this.pedigreeFrente || !this.pedigreeVerso) {
        return false;
      }
    }
    
    // Validar microchip se selecionado
    if (this.temMicrochip) {
      const numeroMicrochip = this.dogForm.get('numeroMicrochip')?.value;
      if (!numeroMicrochip || numeroMicrochip.trim().length === 0) {
        return false;
      }
    }
    
    return userValid && dogValid && fotosValid && videoValid;
  }

  async submitForm() {
    if (this.isFormValid()) {
      try {
        // Primeiro, fazer upload das fotos obrigatórias
        if (!this.fotoPerfil || !this.fotoLateral) {
          alert('Por favor, selecione as fotos de perfil e lateral do cão.');
          return;
        }

        // Upload das fotos obrigatórias
        const uploadFotosResponse = await this.caoService.uploadFotos(
          this.fotoPerfil,
          this.fotoLateral
        ).toPromise();

        if (!uploadFotosResponse) {
          alert('Erro ao fazer upload das fotos. Tente novamente.');
          return;
        }

        // Preparar dados do cão
        const dadosCao: Cao = {
          nome: this.dogForm.value.nome,
          raca: this.dogForm.value.raca,
          sexo: this.dogForm.value.sexo as SexoCao,
          dataNascimento: this.dogForm.value.dataNascimento,
          cor: this.dogForm.value.cor,
          peso: this.dogForm.value.peso,
          altura: this.dogForm.value.altura,
          fotoPerfil: uploadFotosResponse.fotoPerfilUrl,
          fotoLateral: uploadFotosResponse.fotoLateralUrl,
          temPedigree: this.temPedigree,
          temMicrochip: this.temMicrochip,
          numeroMicrochip: this.temMicrochip ? this.dogForm.get('numeroMicrochip')?.value : undefined,
          informacoesAdicionais: this.dogForm.value.informacoesAdicionais
        };

        // Upload do pedigree se existir
        if (this.temPedigree && this.pedigreeFrente && this.pedigreeVerso) {
          const pedigreeResponse = await this.caoService.uploadPedigree(
            this.pedigreeFrente,
            this.pedigreeVerso
          ).toPromise();
          
          if (pedigreeResponse) {
            dadosCao.pedigreeFrenteUrl = pedigreeResponse.pedigreeFrenteUrl;
            dadosCao.pedigreeVersoUrl = pedigreeResponse.pedigreeVersoUrl;
          }
        }

        // Upload do vídeo se necessário
        if (this.videoOption === 'upload' && this.selectedFile) {
          const videoResponse = await this.caoService.uploadVideo(this.selectedFile).toPromise();
          if (videoResponse) {
            dadosCao.videoUrl = videoResponse.videoUrl;
          }
        } else if (this.videoOption === 'youtube') {
          dadosCao.videoUrl = this.videoForm.value.videoUrl;
        }

        // Preparar payload final
        const payload: CadastroCaoPayload = {
          cao: dadosCao,
          videoOption: this.videoOption,
          confirmaWhatsapp: this.videoOption === 'whatsapp' ? this.videoForm.value.confirmaWhatsapp : undefined
        };

        // Adicionar dados do proprietário se for diferente
        if (this.proprietarioDiferente) {
          payload.proprietario = {
            tipoPropriedade: 'TERCEIRO',
            dadosProprietario: {
              nome: this.userForm.value.nomeCompleto,
              cpf: this.userForm.value.cpf,
              email: this.userForm.value.email,
              telefone: this.userForm.value.telefone,
              endereco: {
                logradouro: this.userForm.value.endereco,
                cep: this.userForm.value.cep,
                cidade: this.userForm.value.cidade,
                estado: this.userForm.value.estado
              }
            }
          };
        } else {
          payload.proprietario = {
            tipoPropriedade: 'PROPRIO'
          };
        }

        // Enviar cadastro
        const response = await this.caoService.cadastrarCao(payload).toPromise();
        
        if (response && response.success) {
          console.log('Cadastro realizado com sucesso:', response);
          this.currentStep = 4; // Ir para tela de sucesso
        } else {
          alert('Erro ao cadastrar o cão. Tente novamente.');
        }
        
      } catch (error) {
        console.error('Erro no cadastro:', error);
        alert('Erro ao cadastrar o cão. Verifique os dados e tente novamente.');
      }
    } else {
      let message = 'Por favor, preencha todos os campos obrigatórios';
      
      if (!this.fotoPerfil || !this.fotoLateral) {
        message += ' e selecione as fotos obrigatórias do cão.';
      } else if (this.videoOption === 'upload' && !this.selectedFile) {
        message += ' e envie um vídeo.';
      } else if (this.videoOption === 'youtube' && !this.videoForm.get('videoUrl')?.valid) {
        message += ' e forneça um link válido do YouTube.';
      } else if (this.videoOption === 'whatsapp' && !this.videoForm.get('confirmaWhatsapp')?.value) {
        message += ' e confirme o envio por WhatsApp.';
      }
      
      alert(message);
    }
  }

  async onCepChange(event: any) {
    const cep = event.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      this.isCepLoading = true;
      this.cepStatus = 'loading';
      
      try {
        const endereco = await this.caoService.buscarEnderecoPorCep(cep).toPromise();
        
        if (endereco) {
          this.userForm.patchValue({
            endereco: endereco.logradouro,
            cidade: endereco.cidade,
            estado: endereco.estado
          });
          this.cepStatus = 'success';
        } else {
          this.clearAddressFields();
          this.cepStatus = 'error';
          alert('CEP não encontrado. Verifique o CEP digitado ou preencha o endereço manualmente.');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        this.cepStatus = 'error';
        alert('Erro ao buscar CEP. Preencha o endereço manualmente.');
      } finally {
        this.isCepLoading = false;
      }
    } else if (cep.length === 0) {
      this.clearAddressFields();
      this.cepStatus = 'none';
    }
  }

  clearAddressFields() {
    this.userForm.patchValue({
      endereco: '',
      cidade: '',
      estado: ''
    });
  }

  formatCep(event: any) {
    event.target.value = this.validationService.formatCep(event.target.value);
  }

  openWhatsAppRegistration() {
    const message = encodeURIComponent(
      '🏆 Olá! Gostaria de fazer o cadastro para a Expo Dog BR via WhatsApp.\n\n' +
      'Informações que preciso fornecer:\n' +
      '👤 Dados pessoais (nome, CPF, email, telefone)\n' +
      '🐕 Dados do cão (nome, raça, idade, etc.)\n' +
      '🎥 Vídeo de apresentação\n\n' +
      'Aguardo o atendimento!'
    );
    window.open(`https://wa.me/5515998350750?text=${message}`, '_blank');
  }

  scrollToForm() {
    document.querySelector('.progress-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Métodos de compatibilidade para o template
  togglePedigree() {
    this.temPedigree = !this.temPedigree;
    if (!this.temPedigree) {
      this.pedigreeFrente = this.pedigreeVerso = null;
    }
  }

  toggleMicrochip() {
    this.temMicrochip = !this.temMicrochip;
    if (!this.temMicrochip) {
      this.numeroMicrochip = '';
    }
  }
}

