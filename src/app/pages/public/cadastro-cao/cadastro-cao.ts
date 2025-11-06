import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FooterComponent } from '../components/footer/footer';
import { SocialMediaService } from '../../../services/social-media.service';
import { CaoService } from '../../../services/cao.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { Cao, CadastroCaoPayload, VideoOption, SexoCao } from '../../../interfaces/cao.interface';

@Component({
  selector: 'app-cadastro-cao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FooterComponent],
  templateUrl: './cadastro-cao.html',
  styleUrls: ['./cadastro-cao.scss']
})
export class CadastroCaoComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  socialMedia: any;

  currentStep = 1;
  videoOption: VideoOption = 'upload';
  proprietarioDiferente = false;
  userForm: FormGroup;
  dogForm: FormGroup;
  videoForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isCepLoading = false;
  cepStatus: 'none' | 'loading' | 'success' | 'error' = 'none';
  racas: string[] = [];
  racasLoading = false;
  racasError = false;

  usuarioLogado: any = null;
  fotoPerfil: File | null = null;
  fotoLateral: File | null = null;
  fotoPerfilPreview: string | null = null;
  fotoLateralPreview: string | null = null;
  pedigreeFrente: File | null = null;
  pedigreeVerso: File | null = null;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private socialMediaService: SocialMediaService,
    private caoService: CaoService,
    private authService: AuthService,
    private validationService: ValidationService,
    private router: Router
  ) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
    this.userForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required, this.validationService.cpfValidator()]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      endereco: [''],
      cep: [''],
      cidade: [''],
      estado: ['']
    });

    this.dogForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      raca: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      peso: [''],
      altura: [''],
      temPedigree: [false, Validators.required],
      registroPedigree: [''],
      temMicrochip: [false, Validators.required],
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

  ngOnInit(): void {
    this.preencherDadosUsuarioLogado();
    this.setupConditionalValidators();
    this.carregarRacas();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private carregarRacas(): void {
    this.racasLoading = true;
    this.racasError = false;
    this.subscriptions.add(
      this.caoService.getRacas().subscribe({
        next: (racas) => {
          const unique = Array.from(new Set(racas));
          this.racas = unique.sort((a, b) => a.localeCompare(b, 'pt-BR'));
          this.racasLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar raças:', err);
          this.racasError = true;
          this.racasLoading = false;
        }
      })
    );
  }

  trackByRaca(index: number, raca: string): string {
    return raca;
  }

  private setupConditionalValidators(): void {
    const pedigreeSub = this.dogForm.get('temPedigree')?.valueChanges.subscribe(hasPedigree => {
      const control = this.dogForm.get('registroPedigree');
      if (hasPedigree) {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
        control?.reset();
        this.pedigreeFrente = this.pedigreeVerso = null;
      }
      control?.updateValueAndValidity();
    });

    const microchipSub = this.dogForm.get('temMicrochip')?.valueChanges.subscribe(hasMicrochip => {
      const control = this.dogForm.get('numeroMicrochip');
      if (hasMicrochip) {
        control?.setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      } else {
        control?.clearValidators();
        control?.reset();
      }
      control?.updateValueAndValidity();
    });

    this.subscriptions.add(pedigreeSub);
    this.subscriptions.add(microchipSub);
  }

  nextStep() { if (this.currentStep < 4) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  scrollToForm() {
    document.querySelector('.progress-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openWhatsAppRegistration() {
    const message = encodeURIComponent(
      'Olá! Gostaria de fazer o cadastro para a Expo Dog BR via WhatsApp.\n\n' +
      'Informações que preciso fornecer:\n' +
      'Dados pessoais (nome, CPF, email, telefone)\n' +
      'Dados do cão (nome, raça, idade, etc.)\n' +
      'Vídeo de apresentação\n\n' +
      'Aguardo o atendimento!'
    );
    window.open(`https://wa.me/5515998350750?text=${message}`, '_blank');
  }

  // --- Métodos de Dados do Proprietário ---

  toggleProprietarioDiferente() {
    this.proprietarioDiferente = !this.proprietarioDiferente;
    if (this.proprietarioDiferente) {
      this.limparDadosProprietario();
      this.habilitarValidacoesProprietario();
    } else {
      this.preencherDadosUsuarioLogado();
      this.desabilitarValidacoesProprietario();
    }
  }

  preencherDadosUsuarioLogado() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioLogado = user;
      this.userForm.patchValue({
        nomeCompleto: user.name || '',
        cpf: user.cpf || '',
        email: user.email || '',
        telefone: user.telefone || ''
      });
    }
  }

  limparDadosProprietario() {
    this.userForm.reset();
  }

  habilitarValidacoesProprietario() {
    this.userForm.get('nomeCompleto')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.userForm.get('cpf')?.setValidators([Validators.required, this.validationService.cpfValidator()]);
    this.userForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.userForm.get('telefone')?.setValidators([Validators.required]);
    this.userForm.updateValueAndValidity();
  }

  desabilitarValidacoesProprietario() {
    this.userForm.get('nomeCompleto')?.clearValidators();
    this.userForm.get('cpf')?.clearValidators();
    this.userForm.get('email')?.clearValidators();
    this.userForm.get('telefone')?.clearValidators();
    this.userForm.updateValueAndValidity();
  }

  // --- Métodos de Upload e Arquivos ---

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

  triggerFileInput() { this.fileInput.nativeElement.click(); }

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

  // --- Métodos de Validação e Submissão ---

  isFormValid(): boolean {
    const userValid = this.proprietarioDiferente ? this.userForm.valid : true;
    const dogValid = this.dogForm.valid;
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
    if (this.dogForm.get('temPedigree')?.value) {
      const registroPedigree = this.dogForm.get('registroPedigree')?.value;
      if (!registroPedigree || !this.pedigreeFrente || !this.pedigreeVerso) {
        return false;
      }
    }
    if (this.dogForm.get('temMicrochip')?.value) {
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
        if (!this.fotoPerfil || !this.fotoLateral) {
          alert('Por favor, selecione as fotos de perfil e lateral do cão.');
          return;
        }
        const uploadFotosResponse = await this.caoService.uploadFotos(
          this.fotoPerfil,
          this.fotoLateral
        ).toPromise();
        if (!uploadFotosResponse) {
          alert('Erro ao fazer upload das fotos. Tente novamente.');
          return;
        }
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
          temPedigree: this.dogForm.get('temPedigree')?.value,
          temMicrochip: this.dogForm.get('temMicrochip')?.value,
          numeroMicrochip: this.dogForm.get('temMicrochip')?.value ? this.dogForm.get('temMicrochip')?.value : undefined,
          informacoesAdicionais: this.dogForm.value.informacoesAdicionais
        };
        if (dadosCao.temPedigree && this.pedigreeFrente && this.pedigreeVerso) {
          const pedigreeResponse = await this.caoService.uploadPedigree(
            this.pedigreeFrente,
            this.pedigreeVerso
          ).toPromise();
          if (pedigreeResponse) {
            dadosCao.pedigreeFrenteUrl = pedigreeResponse.pedigreeFrenteUrl;
            dadosCao.pedigreeVersoUrl = pedigreeResponse.pedigreeVersoUrl;
          }
        }
        if (this.videoOption === 'upload' && this.selectedFile) {
          const videoResponse = await this.caoService.uploadVideo(this.selectedFile).toPromise();
          if (videoResponse) {
            dadosCao.videoUrl = videoResponse.videoUrl;
          }
        } else if (this.videoOption === 'youtube') {
          dadosCao.videoUrl = this.videoForm.value.videoUrl;
        }
        const payload: CadastroCaoPayload = {
          cao: dadosCao,
          videoOption: this.videoOption,
          confirmaWhatsapp: this.videoOption === 'whatsapp' ? this.videoForm.value.confirmaWhatsapp : undefined
        };
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
        const response = await this.caoService.cadastrarCao(payload).toPromise();
        if (response && response.success) {
          console.log('Cadastro realizado com sucesso:', response);
          this.currentStep = 4;
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

  // --- Métodos de CEP ---
  onCepChange(event: any) {
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.isCepLoading = true;
      this.cepStatus = 'loading';
      // A chamada ao EnderecoService.buscarEnderecoPorCep foi removida.
      // Se a funcionalidade de busca de CEP ainda for necessária, ela deve ser reimplementada aqui.
      // Por enquanto, apenas desativa o loading.
      this.isCepLoading = false;
      this.cepStatus = 'none';
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

  // --- Outros ---

  selectVideoOption(option: 'upload' | 'youtube' | 'whatsapp') {
    this.videoOption = option;
    const videoUrlControl = this.videoForm.get('videoUrl');
    const confirmaWhatsappControl = this.videoForm.get('confirmaWhatsapp');
    videoUrlControl?.clearValidators();
    confirmaWhatsappControl?.clearValidators();
    if (option === 'youtube') {
      videoUrlControl?.setValidators([Validators.required]);
    } else if (option === 'whatsapp') {
      confirmaWhatsappControl?.setValidators([Validators.requiredTrue]);
    }
    videoUrlControl?.updateValueAndValidity();
    confirmaWhatsappControl?.updateValueAndValidity();
    if (option !== 'upload') {
      this.removeFile();
    }
  }
}
