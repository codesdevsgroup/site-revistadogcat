import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from '../../../components/footer/footer';
import { SocialMediaService } from '../../../services/social-media.service';

// Interface para resposta da API ViaCEP
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Interface para resposta da API dos Correios
interface CorreiosResponse {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  status: number;
}

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
  videoOption: 'upload' | 'youtube' | 'whatsapp' = 'upload';
  proprietarioDiferente = false; // Nova propriedade para controlar se o proprietário é diferente
  userForm: FormGroup;
  dogForm: FormGroup;
  videoForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isCepLoading = false;
  cepStatus: 'none' | 'loading' | 'success' | 'error' = 'none';
  
  // Dados do usuário logado (simulado - em produção viria de um serviço de autenticação)
  usuarioLogado = {
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    cep: '01234-567',
    cidade: 'São Paulo',
    estado: 'SP'
  };
  
  // Propriedades para pedigree
  temPedigree: boolean = false;
  pedigreeFrente: File | null = null;
  pedigreeVerso: File | null = null;
  
  // Propriedades para microchip
  temMicrochip: boolean = false;
  numeroMicrochip: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private socialMediaService: SocialMediaService) {
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
    this.userForm.patchValue({
      nomeCompleto: this.usuarioLogado.nomeCompleto,
      cpf: this.usuarioLogado.cpf,
      email: this.usuarioLogado.email,
      telefone: this.usuarioLogado.telefone,
      endereco: this.usuarioLogado.endereco,
      cep: this.usuarioLogado.cep,
      cidade: this.usuarioLogado.cidade,
      estado: this.usuarioLogado.estado
    });
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
  
  // Métodos para pedigree
  togglePedigree() {
    this.temPedigree = !this.temPedigree;
    if (!this.temPedigree) {
      this.pedigreeFrente = null;
      this.pedigreeVerso = null;
    }
  }
  
  onPedigreeFrenteSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.isValidImageFile(file)) {
      this.pedigreeFrente = file;
    } else {
      event.target.value = '';
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, PDF)');
    }
  }
  
  onPedigreeVersoSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.isValidImageFile(file)) {
      this.pedigreeVerso = file;
    } else {
      event.target.value = '';
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, PDF)');
    }
  }
  
  // Métodos para microchip
  toggleMicrochip() {
    this.temMicrochip = !this.temMicrochip;
    if (!this.temMicrochip) {
      this.numeroMicrochip = '';
    }
  }
  
  // Método auxiliar para validar arquivos de imagem
  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    
    if (file.size > maxSize) {
      alert('O arquivo deve ter no máximo 5MB');
      return false;
    }
    
    return true;
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

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho do arquivo (50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB em bytes
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 50MB');
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        alert('Formato não suportado. Use MP4, MOV ou AVI');
        return;
      }

      // Validar duração do vídeo (aproximadamente através do tamanho)
      // Para vídeos de boa qualidade, 20 segundos ≈ 10-30MB dependendo da resolução
      if (file.size > 30 * 1024 * 1024) {
        const confirm = window.confirm(
          'O arquivo parece grande para um vídeo de 20 segundos. ' +
          'Tem certeza que o vídeo tem no máximo 20 segundos?'
        );
        if (!confirm) {
          return;
        }
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
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isFormValid(): boolean {
    // Validar dados do proprietário apenas se for diferente do usuário logado
    const userValid = this.proprietarioDiferente ? this.userForm.valid : true;
    const dogValid = this.dogForm.valid;
    
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
    
    return userValid && dogValid && videoValid;
  }

  submitForm() {
    if (this.isFormValid()) {
      // Preparar dados para envio
      const dadosEnvio = {
        proprietarioDiferente: this.proprietarioDiferente,
        ...this.dogForm.value,
        videoOption: this.videoOption,
        ...this.videoForm.value,
        temPedigree: this.temPedigree,
        temMicrochip: this.temMicrochip,
        numeroMicrochip: this.temMicrochip ? this.dogForm.get('numeroMicrochip')?.value : null
      };
      
      // Incluir dados do proprietário apenas se for diferente do usuário logado
      if (this.proprietarioDiferente) {
        dadosEnvio.nomeProprietario = this.userForm.value.nomeCompleto;
        dadosEnvio.cpfProprietario = this.userForm.value.cpf;
        dadosEnvio.emailProprietario = this.userForm.value.email;
        dadosEnvio.telefoneProprietario = this.userForm.value.telefone;
        dadosEnvio.enderecoProprietario = this.userForm.value.endereco;
        dadosEnvio.cidade = this.userForm.value.cidade;
        dadosEnvio.estado = this.userForm.value.estado;
      }
      
      // Simular envio dos dados
      console.log('Dados para envio:', dadosEnvio);
      console.log('Proprietário diferente:', this.proprietarioDiferente);
      console.log('Arquivo selecionado:', this.selectedFile);
      
      // Ir para a tela de sucesso
      this.currentStep = 4;
      
      // Aqui você enviaria os dados para o backend
      // this.cadastroService.submitCadastro(dadosEnvio).subscribe(...)
    } else {
      let message = 'Por favor, preencha todos os campos obrigatórios';
      
      if (this.videoOption === 'upload' && !this.selectedFile) {
        message += ' e envie um vídeo.';
      } else if (this.videoOption === 'youtube' && !this.videoForm.get('videoUrl')?.valid) {
        message += ' e forneça um link válido do YouTube.';
      } else if (this.videoOption === 'whatsapp' && !this.videoForm.get('confirmaWhatsapp')?.value) {
        message += ' e confirme o envio por WhatsApp.';
      }
      
      alert(message);
    }
  }

  // Método para buscar CEP usando ViaCEP
  searchCepViaCep(cep: string): Promise<ViaCepResponse | null> {
    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`)
      .toPromise()
      .then(response => {
        if (response && !response.erro) {
          return response;
        }
        return null;
      })
      .catch(() => null);
  }

  // Método para buscar CEP usando API dos Correios (backup)
  searchCepCorreios(cep: string): Promise<CorreiosResponse | null> {
    return this.http.get<CorreiosResponse>(`https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente/consultaCEP?cep=${cep}`)
      .toPromise()
      .then(response => {
        if (response && response.status === 200) {
          return response;
        }
        return null;
      })
      .catch(() => null);
  }

  // Método principal para buscar CEP
  async onCepChange(event: any) {
    const cep = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (cep.length === 8) {
      this.isCepLoading = true;
      this.cepStatus = 'loading';
      
      try {
        // Primeiro tenta a ViaCEP
        let result = await this.searchCepViaCep(cep);
        
        if (result) {
          this.fillAddressFromViaCep(result);
          this.cepStatus = 'success';
        } else {
          // Se falhar, tenta a API dos Correios como backup
          const correiosResult = await this.searchCepCorreios(cep);
          if (correiosResult) {
            this.fillAddressFromCorreios(correiosResult);
            this.cepStatus = 'success';
          } else {
            // Se ambas falharem, limpa os campos e mostra mensagem
            this.clearAddressFields();
            this.cepStatus = 'error';
            alert('CEP não encontrado. Verifique o CEP digitado ou preencha o endereço manualmente.');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        this.cepStatus = 'error';
        alert('Erro ao buscar CEP. Preencha o endereço manualmente.');
      } finally {
        this.isCepLoading = false;
      }
    } else if (cep.length === 0) {
      // Se o CEP foi apagado, limpa os campos
      this.clearAddressFields();
      this.cepStatus = 'none';
    }
  }

  // Preenche os campos com dados da ViaCEP
  fillAddressFromViaCep(data: ViaCepResponse) {
    const endereco = data.logradouro + (data.complemento ? ' - ' + data.complemento : '');
    
    this.userForm.patchValue({
      endereco: endereco,
      cidade: data.localidade,
      estado: data.uf
    });
  }

  // Preenche os campos com dados da API dos Correios
  fillAddressFromCorreios(data: CorreiosResponse) {
    this.userForm.patchValue({
      endereco: data.street,
      cidade: data.city,
      estado: data.state
    });
  }

  // Limpa os campos de endereço
  clearAddressFields() {
    this.userForm.patchValue({
      endereco: '',
      cidade: '',
      estado: ''
    });
  }

  // Formatar CEP enquanto digita
  formatCep(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    event.target.value = value;
  }

  openWhatsAppRegistration() {
    const whatsappNumber = '5515998350750'; // Número do WhatsApp da revista
    const message = encodeURIComponent(
      '🏆 Olá! Gostaria de fazer o cadastro para a Expo Dog BR via WhatsApp.\n\n' +
      'Informações que preciso fornecer:\n' +
      '👤 Dados pessoais (nome, CPF, email, telefone)\n' +
      '🐕 Dados do cão (nome, raça, idade, etc.)\n' +
      '🎥 Vídeo de apresentação\n\n' +
      'Aguardo o atendimento!'
    );
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  scrollToForm() {
    const progressSection = document.querySelector('.progress-section');
    if (progressSection) {
      progressSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}

