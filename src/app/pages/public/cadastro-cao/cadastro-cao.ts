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
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { Subscription } from "rxjs";
import { FooterComponent } from "../components/footer/footer";
import { SocialMediaService } from "../../../services/social-media.service";
import { CaoService } from "../../../services/cao.service";
import { AuthService } from "../../../services/auth.service";
import { ValidationService } from "../../../services/validation.service";
import { NotificationService } from "../../../services/notification.service";
import {
  Cao,
  CadastroCaoPayload,
  VideoOption,
  SexoCao,
  CadastroCaoResponse,
} from "../../../interfaces/cao.interface";
import { SocialMedia } from "../../../interfaces/social-media.interface";
import { Usuario as User } from "../../../interfaces/usuario.interface";

@Component({
  selector: "app-cadastro-cao",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FooterComponent],
  templateUrl: "./cadastro-cao.html",
  styleUrls: ["./cadastro-cao.scss"],
})
export class CadastroCaoComponent implements OnInit, OnDestroy {
  @ViewChild("fileInput") fileInput!: ElementRef;
  socialMedia: SocialMedia;

  currentStep = 1;
  videoOption: VideoOption = "upload";
  proprietarioDiferente = false;
  userForm: FormGroup;
  dogForm: FormGroup;
  videoForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isSubmitting = false;
  isCepLoading = false;
  cepStatus: "none" | "loading" | "success" | "error" = "none";
  racas: { id: string; nome: string }[] = [];
  racasLoading = false;
  racasError = false;

  usuarioLogado: User | null = null;
  fotoPerfil: File | null = null;
  fotoLateral: File | null = null;
  fotoPerfilPreview: string | null = null;
  fotoLateralPreview: string | null = null;
  pedigreeFrente: File | null = null;
  pedigreeVerso: File | null = null;

  private subscriptions = new Subscription();
  showSuccessModal = false;
  validationErrors: string[] = [];
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
    private notificationService: NotificationService,
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
    // Fluxo ajustado: último passo é o 4 (Fotos). Envio de vídeo foi removido do cadastro.
    if (this.currentStep < 4) this.currentStep++;
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

  onFotoPerfilSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        if (validation.error) {
          this.notificationService.error(validation.error);
        }
        return;
      }
      this.fotoPerfil = file;
      const reader = new FileReader();
      reader.onload = (e: any) => (this.fotoPerfilPreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onFotoLateralSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        if (validation.error) {
          this.notificationService.error(validation.error);
        }
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

  onPedigreeFrenteSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        if (validation.error) {
          this.notificationService.error(validation.error);
        }
        return;
      }
      this.pedigreeFrente = file;
    }
  }

  onPedigreeVersoSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const validation = this.validationService.validateImageFile(file);
      if (!validation.valid) {
        if (validation.error) {
          this.notificationService.error(validation.error);
        }
        return;
      }
      this.pedigreeVerso = file;
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const validation = this.validationService.validateVideoFile(file);
      if (!validation.valid) {
        if (validation.error) {
          this.notificationService.error(validation.error);
        }
        return;
      }
      if (validation.warning && !window.confirm(validation.warning)) {
        return;
      }
      this.selectedFile = file;
      this.uploadProgress = 0;
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = "";
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  formatFileSize(bytes: number): string {
    return this.validationService.formatFileSize(bytes);
  }

  // Validação de vídeo removida do fluxo de cadastro

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
        return false;
      }
    }

    return userValid && dogValid && fotosValid;
  }

  calcularIdade(data: string | Date | null): string {
    if (!data) return "-";
    const nascimento = typeof data === "string" ? new Date(data) : data;
    if (!(nascimento instanceof Date) || isNaN(nascimento.getTime()))
      return "-";

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

  private buildValidationErrors(): string[] {
    const errors: string[] = [];

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

    if (this.dogForm.get("temPedigree")?.value) {
      if (this.dogForm.get("registroPedigree")?.invalid) {
        errors.push("Nº de registro do pedigree");
      }
      if (!this.pedigreeFrente || !this.pedigreeVerso) {
        errors.push("Imagens do pedigree (frente e verso)");
      }
    }

    if (this.dogForm.get("temMicrochip")?.value) {
      if (this.dogForm.get("numeroMicrochip")?.invalid) {
        errors.push("Nº do microchip (15 dígitos)");
      }
    }

    if (!this.fotoPerfil) errors.push("Foto de perfil do cão");
    if (!this.fotoLateral) errors.push("Foto lateral do cão");

    // Erros relacionados a vídeo foram removidos do cadastro

    return errors;
  }

  submitForm() {
    this.validationErrors = this.buildValidationErrors();
    if (!this.isFormValid() || this.isSubmitting) {
      this.userForm.markAllAsTouched();
      this.dogForm.markAllAsTouched();
      // videoForm não é mais necessário neste fluxo
      if (this.validationErrors.length > 0) {
        this.notificationService.error(
          "Existem campos obrigatórios pendentes: " +
            this.validationErrors.join(", "),
        );
      }
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;

    const formData = new FormData();

    Object.keys(this.dogForm.controls).forEach((key) => {
      const value = this.dogForm.get(key)?.value;
      if (key === "raca" && value === "Outra") {
        // racaSugerida é tratada abaixo
      } else if (key === "raca") {
        formData.append("racaId", value);
      } else if (value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    if (this.proprietarioDiferente) {
      Object.keys(this.userForm.controls).forEach((key) => {
        const value = this.userForm.get(key)?.value;
        if (value !== null && value !== "") {
          formData.append(`proprietario[${key}]`, String(value));
        }
      });
    }

    // Removido: envio de campos de vídeo (videoOption, videoUrl, whatsappContato)

    if (this.fotoPerfil) formData.append("fotoPerfil", this.fotoPerfil);
    if (this.fotoLateral) formData.append("fotoLateral", this.fotoLateral);
    if (this.pedigreeFrente)
      formData.append("pedigreeFrente", this.pedigreeFrente);
    if (this.pedigreeVerso)
      formData.append("pedigreeVerso", this.pedigreeVerso);
    // Removido: envio de arquivo de vídeo

    // Log de diagnóstico: inspecionar o payload do FormData antes do envio
    try {
      const debugPayload: string[] = [];
      formData.forEach((value, key) => {
        if (value instanceof File) {
          debugPayload.push(`${key}=[File:${value.name}|${value.type}|${value.size}]`);
        } else {
          debugPayload.push(`${key}=${String(value)}`);
        }
      });
      console.log("FormData (diagnóstico)", debugPayload.join(", "));
    } catch (e) {
      console.warn("Não foi possível imprimir o FormData para diagnóstico:", e);
    }

    this.subscriptions.add(
      this.caoService.cadastrarCaoUnificado(formData).subscribe({
        next: (event: HttpEvent<CadastroCaoResponse>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              if (event.total) {
                this.uploadProgress = Math.round(
                  (event.loaded / event.total) * 100,
                );
              }
              break;
            case HttpEventType.Response:
              const response = event.body;
              if (response) {
                console.log("Cadastro realizado com sucesso:", response);
                this.currentStep = 6;
                this.successCaoId = response.data?.caoId ?? null;
                this.successNomeCao = this.dogForm.value.nome;
                this.showSuccessModal = true;
              } else {
                this.notificationService.error(
                  "Erro ao cadastrar o cão. A resposta do servidor foi vazia.",
                );
              }
              this.isSubmitting = false;
              break;
          }
        },
        error: (error) => {
          console.error("Erro no cadastro:", error);
          this.notificationService.error(
            `Erro ao cadastrar o cão: ${error.message || "Erro desconhecido"}`,
          );
          this.isSubmitting = false;
          this.uploadProgress = 0;
        },
      }),
    );
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  goToHome() {
    this.showSuccessModal = false;
    this.router.navigateByUrl("/");
  }

  goToPerfil() {
    this.showSuccessModal = false;
    this.router.navigateByUrl("/perfil");
  }

  onCepChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const cep = target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      this.isCepLoading = true;
      this.cepStatus = "loading";
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

  selectVideoOption(option: "upload" | "youtube" | "whatsapp") {
    this.videoOption = option;
    const videoUrlControl = this.videoForm.get("videoUrl");
    const confirmaWhatsappControl = this.videoForm.get("confirmaWhatsapp");
    videoUrlControl?.clearValidators();
    confirmaWhatsappControl?.clearValidators();
    if (option === "youtube") {
      videoUrlControl?.setValidators([Validators.required]);
      confirmaWhatsappControl?.reset(false);
    } else if (option === "whatsapp") {
      confirmaWhatsappControl?.setValidators([Validators.requiredTrue]);
      videoUrlControl?.reset("");
    }
    videoUrlControl?.updateValueAndValidity();
    confirmaWhatsappControl?.updateValueAndValidity();
    if (option !== "upload") {
      this.removeFile();
    }

    if (option === "upload") {
      videoUrlControl?.reset("");
      confirmaWhatsappControl?.reset(false);
    }
  }
}
