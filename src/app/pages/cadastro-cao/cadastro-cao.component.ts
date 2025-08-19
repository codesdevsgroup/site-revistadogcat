import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from '../../components/footer/footer.component';
import { SocialMediaService } from '../../services/social-media.service';

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
  templateUrl: './cadastro-cao.component.html',
  styleUrl: './cadastro-cao.component.scss'
})
export class CadastroCaoComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  socialMedia: any;

  currentStep = 1;
  videoOption: 'upload' | 'youtube' | 'whatsapp' = 'upload';
  userForm: FormGroup;
  dogForm: FormGroup;
  videoForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isCepLoading = false;
  cepStatus: 'none' | 'loading' | 'success' | 'error' = 'none';

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

    this.dogForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      raca: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      peso: [''],
      altura: [''],
      registroPedigree: ['', [Validators.required]],
      microchip: [''],
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
    const userValid = this.userForm.valid;
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
    
    return userValid && dogValid && videoValid;
  }

  submitForm() {
    if (this.isFormValid()) {
      // Simular envio dos dados
      console.log('Dados do usuário:', this.userForm.value);
      console.log('Dados do cão:', this.dogForm.value);
      console.log('Dados do vídeo:', this.videoForm.value);
      console.log('Opção de vídeo:', this.videoOption);
      console.log('Arquivo selecionado:', this.selectedFile);
      
      // Ir para a tela de sucesso
      this.currentStep = 4;
      
      // Aqui você enviaria os dados para o backend
      // this.cadastroService.submitCadastro(formData).subscribe(...)
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
}
