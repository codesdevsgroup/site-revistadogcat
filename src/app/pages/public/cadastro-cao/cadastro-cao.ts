import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { FooterComponent } from "../components/footer/footer";
import { SocialMediaService } from "../../../services/social-media.service";
import { CaoService } from "../../../services/cao.service";
import { AuthService } from "../../../services/auth.service";
import { ValidationService } from "../../../services/validation.service";
import {
  Cao,
  CadastroCaoPayload,
  VideoOption,
  SexoCao,
} from "../../../interfaces/cao.interface";

@Component({
  selector: "app-cadastro-cao",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FooterComponent],
  templateUrl: "./cadastro-cao.html",
  styleUrls: ["./cadastro-cao.scss"],
})
export class CadastroCaoComponent implements OnInit, OnDestroy {
  @ViewChild("fileInput") fileInput!: ElementRef;
  socialMedia: any;

  currentStep = 1;
  videoOption: VideoOption = "upload";
  proprietarioDiferente = false;
  userForm: FormGroup;
  dogForm: FormGroup;
  videoForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isCepLoading = false;
  cepStatus: "none" | "loading" | "success" | "error" = "none";
  racas: { id: string; nome: string }[] = [];
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
  // Controle de UI
  showSuccessModal = false; // Exibe modal de agradecimento após cadastro bem-sucedido
  validationErrors: string[] = []; // Lista os campos obrigatórios faltantes com mensagens claras
  // Dados de sucesso para exibir no modal
  successCaoId: string | null = null;
  successProprietarioId: string | null = null;
  successNomeCao: string | null = null;

  constructor(
    private fb: FormBuilder,
    private socialMediaService: SocialMediaService,
    private caoService: CaoService,
    private authService: AuthService,
    private validationService: ValidationService,
    private router: Router,
  ) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
    this.userForm = this.fb.group({
      nomeCompleto: ["", [Validators.required, Validators.minLength(2)]],
      cpf: ["", [Validators.required, this.validationService.cpfValidator()]],
      email: ["", [Validators.required, Validators.email]],
      telefone: ["", [Validators.required]],
      endereco: [""],
      cep: [""],
      cidade: [""],
      estado: [""],
    });

    this.dogForm = this.fb.group({
      nome: ["", [Validators.required, Validators.minLength(2)]],
      raca: ["", [Validators.required]],
      racaSugerida: [""],
      sexo: ["", [Validators.required]],
      dataNascimento: ["", [Validators.required]],
      peso: [""],
      altura: [""],
      temPedigree: [false, Validators.required],
      registroPedigree: [""],
      temMicrochip: [false, Validators.required],
      numeroMicrochip: [""],
      nomePai: [""],
      nomeMae: [""],
      titulos: [""],
      caracteristicas: [""],
    });

    this.videoForm = this.fb.group({
      videoUrl: [""],
      confirmaWhatsapp: [false],
      observacoes: [""],
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
    this.dogForm.get("raca")?.disable({ emitEvent: false });
    this.subscriptions.add(
      this.caoService.getRacas().subscribe({
        next: (racas) => {
          this.racas = racas.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR"),
          );
          this.racasLoading = false;
          this.dogForm.get("raca")?.enable({ emitEvent: false });
        },
        error: (err) => {
          console.error("Erro ao carregar raças:", err);
          this.racasError = true;
          this.racasLoading = false;
          // Mantém desabilitado em caso de erro para evitar seleção sem dados
          this.dogForm.get("raca")?.disable({ emitEvent: false });
        },
      }),
    );
  }

  trackByRaca(index: number, raca: { id: string; nome: string }): string {
    return raca.id;
  }

  private setupConditionalValidators(): void {
    const pedigreeSub = this.dogForm
      .get("temPedigree")
      ?.valueChanges.subscribe((hasPedigree) => {
        const control = this.dogForm.get("registroPedigree");
        if (hasPedigree) {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
          control?.reset();
          this.pedigreeFrente = this.pedigreeVerso = null;
        }
        control?.updateValueAndValidity();
      });

    const microchipSub = this.dogForm
      .get("temMicrochip")
      ?.valueChanges.subscribe((hasMicrochip) => {
        const control = this.dogForm.get("numeroMicrochip");
        if (hasMicrochip) {
          control?.setValidators([
            Validators.required,
            Validators.minLength(15),
            Validators.maxLength(15),
          ]);
        } else {
          control?.clearValidators();
          control?.reset();
        }
        control?.updateValueAndValidity();
      });

    const racaSub = this.dogForm
      .get("raca")
      ?.valueChanges.subscribe((value) => {
        const racaSugeridaControl = this.dogForm.get("racaSugerida");
        if (value === "Outra") {
          racaSugeridaControl?.setValidators([
            Validators.required,
            Validators.minLength(3),
          ]);
        } else {
          racaSugeridaControl?.clearValidators();
          racaSugeridaControl?.reset("");
        }
        racaSugeridaControl?.updateValueAndValidity();
      });

    this.subscriptions.add(racaSub);
  }

  nextStep() {
    if (this.currentStep < 5) this.currentStep++;
  }
  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  scrollToForm() {
    document
      .querySelector(".progress-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  openWhatsAppRegistration() {
    const message = encodeURIComponent(
      "Olá! Gostaria de fazer o cadastro para a Expo Dog BR via WhatsApp.\n\n" +
        "Informações que preciso fornecer:\n" +
        "Dados pessoais (nome, CPF, email, telefone)\n" +
        "Dados do cão (nome, raça, idade, etc.)\n" +
        "Vídeo de apresentação\n\n" +
        "Aguardo o atendimento!",
    );
    window.open(`https://wa.me/5515998350750?text=${message}`, "_blank");
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
        nomeCompleto: user.name || "",
        cpf: user.cpf || "",
        email: user.email || "",
        telefone: user.telefone || "",
      });
    }
  }

  limparDadosProprietario() {
    this.userForm.reset();
  }

  habilitarValidacoesProprietario() {
    this.userForm
      .get("nomeCompleto")
      ?.setValidators([Validators.required, Validators.minLength(2)]);
    this.userForm
      .get("cpf")
      ?.setValidators([
        Validators.required,
        this.validationService.cpfValidator(),
      ]);
    this.userForm
      .get("email")
      ?.setValidators([Validators.required, Validators.email]);
    this.userForm.get("telefone")?.setValidators([Validators.required]);
    this.userForm.updateValueAndValidity();
  }

  desabilitarValidacoesProprietario() {
    this.userForm.get("nomeCompleto")?.clearValidators();
    this.userForm.get("cpf")?.clearValidators();
    this.userForm.get("email")?.clearValidators();
    this.userForm.get("telefone")?.clearValidators();
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
      reader.onload = (e: any) => (this.fotoPerfilPreview = e.target.result);
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
      reader.onload = (e: any) => (this.fotoLateralPreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  removeFotoPerfil(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoPerfil = null;
    this.fotoPerfilPreview = null;
    const input = document.getElementById("fotoPerfil") as HTMLInputElement;
    if (input) input.value = "";
  }

  removeFotoLateral(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoLateral = null;
    this.fotoLateralPreview = null;
    const input = document.getElementById("fotoLateral") as HTMLInputElement;
    if (input) input.value = "";
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
    this.fileInput.nativeElement.value = "";
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
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

  // --- Métodos de Validação e Submissão ---

  // Libera o botão "Enviar Cadastro" quando uma das três opções de vídeo estiver válida
  isVideoStepValid(): boolean {
    switch (this.videoOption) {
      case "upload":
        return this.selectedFile !== null;
      case "youtube":
        return this.videoForm.get("videoUrl")?.valid || false;
      case "whatsapp":
        return this.videoForm.get("confirmaWhatsapp")?.value === true;
      default:
        return false;
    }
  }

  isFormValid(): boolean {
    const userValid = this.proprietarioDiferente ? this.userForm.valid : true;
    const dogValid = this.dogForm.valid;
    const fotosValid = this.fotoPerfil !== null && this.fotoLateral !== null;

    if (
      this.dogForm.get("raca")?.value === "Outra" &&
      !this.dogForm.get("racaSugerida")?.value
    ) {
      return false;
    }

    if (this.dogForm.get("temPedigree")?.value) {
      if (
        !this.dogForm.get("registroPedigree")?.value &&
        !this.pedigreeFrente &&
        !this.pedigreeVerso
      ) {
        return false; // Se tem pedigree, deve ter ou o registro ou uma das fotos
      }
    }

    return userValid && dogValid && fotosValid && this.isVideoStepValid();
  }

  // Calcula idade aproximada com base na data de nascimento
  calcularIdade(data: string | Date | null): string {
    if (!data) return "-";
    const nascimento = typeof data === "string" ? new Date(data) : data;
    if (!(nascimento instanceof Date) || isNaN(nascimento.getTime())) return "-";

    const hoje = new Date();
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    let dias = hoje.getDate() - nascimento.getDate();

    if (dias < 0) {
      meses -= 1;
    }
    if (meses < 0) {
      anos -= 1;
      meses += 12;
    }

    // Ajuste para evitar negativos
    if (anos < 0) anos = 0;
    if (meses < 0) meses = 0;

    if (anos === 0 && meses === 0) {
      return "menos de 1 mês";
    }
    if (anos === 0) {
      return `${meses} mês(es)`;
    }
    if (meses === 0) {
      return `${anos} ano(s)`;
    }
    return `${anos} ano(s) e ${meses} mês(es)`;
  }

  // Constrói uma lista de mensagens claras indicando quais campos obrigatórios faltam
  private buildValidationErrors(): string[] {
    const errors: string[] = [];

    // Campos do proprietário (somente quando cadastro para terceiros ou sem usuário logado)
    if (this.proprietarioDiferente || !this.usuarioLogado) {
      const ownerControls: { key: string; label: string }[] = [
        { key: "nomeCompleto", label: "Nome Completo do proprietário" },
        { key: "cpf", label: "CPF do proprietário" },
        { key: "email", label: "Email do proprietário" },
        { key: "telefone", label: "Telefone/WhatsApp do proprietário" },
      ];
      ownerControls.forEach(({ key, label }) => {
        const control = this.userForm.get(key);
        if (control && control.invalid) errors.push(label);
      });
    }

    // Campos do cão
    const dogControls: { key: string; label: string }[] = [
      { key: "nome", label: "Nome do cão" },
      { key: "raca", label: "Raça do cão" },
      { key: "sexo", label: "Sexo do cão" },
      { key: "dataNascimento", label: "Data de nascimento do cão" },
    ];
    dogControls.forEach(({ key, label }) => {
      const control = this.dogForm.get(key);
      if (control && control.invalid) errors.push(label);
    });

    // Condicionais de pedigree
    if (this.dogForm.get("temPedigree")?.value) {
      if (this.dogForm.get("registroPedigree")?.invalid) {
        errors.push("Nº de registro do pedigree");
      }
      if (!this.pedigreeFrente || !this.pedigreeVerso) {
        errors.push("Imagens do pedigree (frente e verso)");
      }
    }

    // Condicionais de microchip
    if (this.dogForm.get("temMicrochip")?.value) {
      if (this.dogForm.get("numeroMicrochip")?.invalid) {
        errors.push("Nº do microchip (15 dígitos)");
      }
    }

    // Fotos obrigatórias
    if (!this.fotoPerfil) errors.push("Foto de perfil do cão");
    if (!this.fotoLateral) errors.push("Foto lateral do cão");

    // Validação de vídeo conforme opção
    switch (this.videoOption) {
      case "upload":
        if (!this.selectedFile) errors.push("Arquivo de vídeo do cão");
        break;
      case "youtube":
        if (!this.videoForm.get("videoUrl")?.valid)
          errors.push("URL válida do vídeo no YouTube");
        break;
      case "whatsapp":
        if (!this.videoForm.get("confirmaWhatsapp")?.value)
          errors.push("Confirmação de envio de vídeo via WhatsApp");
        break;
    }

    return errors;
  }

  async submitForm() {
    this.validationErrors = this.buildValidationErrors();
    if (!this.isFormValid()) {
      this.userForm.markAllAsTouched();
      this.dogForm.markAllAsTouched();
      this.videoForm.markAllAsTouched();
      console.log("Formulário inválido. Erros:", this.validationErrors);
      alert(
        "Existem campos obrigatórios pendentes. Por favor, verifique os erros listados no final do formulário.",
      );
      return;
    }

    const formData = new FormData();

    // 1. Adicionar dados do cão
    Object.keys(this.dogForm.controls).forEach((key) => {
      const value = this.dogForm.get(key)?.value;
      if (key === "raca" && value === "Outra") {
        // Não adiciona a racaId, o backend usará a racaSugerida
      } else if (key === "raca") {
        formData.append("racaId", value); // Assumindo que o valor é o ID da raça
      } else if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    // 2. Adicionar dados do proprietário (se for terceiro)
    if (this.proprietarioDiferente) {
      Object.keys(this.userForm.controls).forEach((key) => {
        const value = this.userForm.get(key)?.value;
        if (value !== null && value !== "") {
          formData.append(`proprietario[${key}]`, value);
        }
      });
    }

    // 3. Adicionar dados de vídeo
    formData.append("videoOption", this.videoOption);
    if (this.videoOption === "youtube") {
      formData.append("videoUrl", this.videoForm.get("videoUrl")?.value);
    } else if (this.videoOption === "whatsapp") {
      formData.append(
        "confirmaWhatsapp",
        this.videoForm.get("confirmaWhatsapp")?.value,
      );
    }

    // 4. Adicionar arquivos
    if (this.fotoPerfil) formData.append("fotoPerfil", this.fotoPerfil);
    if (this.fotoLateral) formData.append("fotoLateral", this.fotoLateral);
    if (this.pedigreeFrente)
      formData.append("pedigreeFrente", this.pedigreeFrente);
    if (this.pedigreeVerso)
      formData.append("pedigreeVerso", this.pedigreeVerso);
    if (this.selectedFile) formData.append("video", this.selectedFile); // Assumindo que o campo no backend é 'video'

    try {
      const response = await this.caoService
        .cadastrarCaoUnificado(formData)
        .toPromise();
      if (response) {
        // A resposta de sucesso não tem mais a propriedade 'success'
        console.log("Cadastro realizado com sucesso:", response);
        this.currentStep = 6; // Avança para a tela de sucesso
        // Ajuste: a resposta segue a interface CadastroCaoResponse, com dados em response.data
        this.successCaoId = (response as any)?.data?.caoId ?? null;
        this.successNomeCao = this.dogForm.value.nome;
        this.showSuccessModal = true;
      } else {
        alert("Erro ao cadastrar o cão. A resposta do servidor foi vazia.");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert(
        `Erro ao cadastrar o cão: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    }
  }

  // Fecha o modal de sucesso
  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  // Ação auxiliar: direciona para uma página pós-cadastro (ex.: página inicial)
  goToHome() {
    this.showSuccessModal = false;
    this.router.navigateByUrl("/");
  }

  // --- Métodos de CEP ---
  onCepChange(event: any) {
    const cep = event.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      this.isCepLoading = true;
      this.cepStatus = "loading";
      // A chamada ao EnderecoService.buscarEnderecoPorCep foi removida.
      // Se a funcionalidade de busca de CEP ainda for necessária, ela deve ser reimplementada aqui.
      // Por enquanto, apenas desativa o loading.
      this.isCepLoading = false;
      this.cepStatus = "none";
    } else if (cep.length === 0) {
      this.clearAddressFields();
      this.cepStatus = "none";
    }
  }

  clearAddressFields() {
    this.userForm.patchValue({
      endereco: "",
      cidade: "",
      estado: "",
    });
  }

  formatCep(event: any) {
    event.target.value = this.validationService.formatCep(event.target.value);
  }

  // --- Outros ---

  selectVideoOption(option: "upload" | "youtube" | "whatsapp") {
    this.videoOption = option;
    const videoUrlControl = this.videoForm.get("videoUrl");
    const confirmaWhatsappControl = this.videoForm.get("confirmaWhatsapp");
    videoUrlControl?.clearValidators();
    confirmaWhatsappControl?.clearValidators();
    if (option === "youtube") {
      videoUrlControl?.setValidators([Validators.required]);
    } else if (option === "whatsapp") {
      confirmaWhatsappControl?.setValidators([Validators.requiredTrue]);
    }
    videoUrlControl?.updateValueAndValidity();
    confirmaWhatsappControl?.updateValueAndValidity();
    if (option !== "upload") {
      this.removeFile();
    }
  }
}
