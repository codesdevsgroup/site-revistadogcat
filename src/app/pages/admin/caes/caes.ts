import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { Router } from "@angular/router";
import {
  CadastroCaoService,
  StatusCadastro,
} from "../../../services/cadastro-cao.service";
import { RacaService } from "../../../services/raca.service";
import { AuthService } from "../../../services/auth.service";
import { firstValueFrom } from "rxjs";
import { CaoDetailsDialogComponent } from "src/app/pages/admin/components/cao-details-dialog/cao-details-dialog.component";
import { AdminCao as Cao } from "src/app/interfaces";
import { RacaManageDialogComponent } from "src/app/pages/admin/components/raca-manage-dialog/raca-manage-dialog.component";

interface CaoListItem {
  cadastroId: string;
  nomeCao: string;
  raca: {
    nome: string;
  };
  dataNascimento: Date;
  sexo: string;
  proprietario: {
    nome: string;
  };
  createdAt: Date;
  nome?: string;
  registroPedigree?: string;
  numeroRegistro?: string;
  racaId?: string;
  donoCao?: {
    nome: string;
  };
  status?: StatusCadastro;
  racaSugerida?: string;
}

interface Raca {
  racaId: string;
  id?: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

@Component({
  selector: "app-caes",
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TableModule, InputTextModule, SelectModule, ButtonModule, CaoDetailsDialogComponent, RacaManageDialogComponent],
  templateUrl: "./caes.html",
  styleUrls: ["./caes.scss"],
})
export class CaesComponent implements OnInit {
  caes: CaoListItem[] = [];
  racas: Raca[] = [];
  filteredRacas: Raca[] = [];
  loading = false;
  searchTerm = "";
  selectedRaca = "";
  selectedStatus: StatusCadastro | "" = "";
  statuses: { value: StatusCadastro | ""; label: string }[] = [
    { value: "", label: "Todos os status" },
    { value: "APROVADO", label: "Aprovados" },
    { value: "CADASTRO_INCOMPLETO", label: "Cadastro Incompleto" },
    { value: "REJEITADO", label: "Rejeitados" },
  ];

  // Opções para uso por linha (sem a opção vazia)
  get statusOptions(): { value: StatusCadastro; label: string }[] {
    return this.statuses
      .filter((s) => s.value !== "")
      .map((s) => ({ value: s.value as StatusCadastro, label: s.label }));
  }

  pendentesRacaOnly = false;

  showRacaModal = false;
  racaSearchTerm = "";
  racaForm = {
    racaId: "",
    nome: "",
    descricao: "",
    ativo: true,
  };
  isEditingRaca = false;
  racaModalLoading = false;
  private caoEmAprovacao: CaoListItem | null = null;

  showCaoModal = false;
  selectedCao: Cao | null = null;

  constructor(
    private cadastroCaoService: CadastroCaoService,
    private racaService: RacaService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadCaes();
    this.loadRacas();
  }

  async loadCaes() {
    try {
      this.loading = true;

      const normalizeList = (resp: any): any[] => {
        if (Array.isArray(resp)) return resp;
        if (resp?.data && Array.isArray(resp.data.data)) return resp.data.data;
        if (resp && Array.isArray(resp.data)) return resp.data;
        return [];
      };

      const params: any = {};
      if (this.selectedStatus) {
        params.status = this.selectedStatus;
      }

      const result = await firstValueFrom(
        this.cadastroCaoService.listar(params),
      );
      const data = normalizeList(result);

      this.caes = (data || []).map((cao: any) => {
        const racaEncontrada = this.racas.find(
          (r) => r.nome.toLowerCase() === cao.raca?.toLowerCase(),
        );

        return {
          ...cao,
          dataNascimento: new Date(cao.dataNascimento),
          createdAt: new Date(cao.createdAt),
          racaId: racaEncontrada ? racaEncontrada.id : undefined,
          status: cao.status as StatusCadastro,
        };
      });
    } catch (error) {
      console.error("Erro ao carregar cães:", error);
    } finally {
      this.loading = false;
    }
  }

  async loadRacas() {
    try {
      const response = await this.racaService.findAll();
      this.racas = (response.data || [])
        .map((raca) => ({
          ...raca,
          id: raca.racaId,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      this.updateFilteredRacas();
    } catch (error) {
      console.error("Erro ao carregar raças:", error);
    }
  }

  filterCaes() {
    console.log("Filtrar cães por raça:", this.selectedRaca);
  }

  updateFilteredRacas() {
    if (!this.racaSearchTerm.trim()) {
      this.filteredRacas = [...this.racas];
    } else {
      const searchTerm = this.racaSearchTerm.toLowerCase().trim();
      this.filteredRacas = this.racas.filter((raca) =>
        raca.nome.toLowerCase().includes(searchTerm),
      );
    }
  }

  onRacaFilterChange() {
    this.updateFilteredRacas();
  }

  openBreedModal() {
    this.openRacaModal();
  }

  canManageBreeds(): boolean {
    return this.isAdmin;
  }

  get isLoading(): boolean {
    return this.loading;
  }

  get filteredCaes() {
    return this.caes.filter((cao) => {
      const matchesSearch =
        !this.searchTerm ||
        (cao.nomeCao || cao.nome || "")
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        (cao.proprietario?.nome || cao.donoCao?.nome || "")
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesRaca =
        !this.selectedRaca || cao.raca.nome === this.selectedRaca;

      return matchesSearch && matchesRaca;
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR");
  }

  calculateAge(birthDate: Date): string {
    const birth = birthDate;
    const today = new Date();
    const ageInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());

    if (ageInMonths < 12) {
      return `${ageInMonths} ${ageInMonths === 1 ? "mês" : "meses"}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} ${years === 1 ? "ano" : "anos"}`;
    }
  }

  formatAge(birthDate: Date): string {
    return this.calculateAge(birthDate);
  }

  getRacaName(racaId?: string): string {
    if (!racaId) return "N/A";
    const raca = this.racas.find((r) => r.racaId === racaId);
    return raca ? raca.nome : "N/A";
  }

  openRacaModal() {
    this.showRacaModal = true;
    this.racaSearchTerm = "";
    this.resetRacaForm();
    this.updateFilteredRacas();
  }

  closeRacaModal() {
    this.showRacaModal = false;
    this.resetRacaForm();
  }

  resetRacaForm() {
    this.racaForm = {
      racaId: "",
      nome: "",
      descricao: "",
      ativo: true,
    };
    this.isEditingRaca = false;
  }

  editRaca(raca: Raca) {
    this.racaForm = {
      racaId: raca.racaId,
      nome: raca.nome,
      descricao: raca.descricao || "",
      ativo: raca.ativo,
    };
    this.isEditingRaca = true;
    this.showRacaModal = true;
  }

  async saveRaca() {
    if (!this.racaForm.nome.trim()) {
      alert("Nome da raça é obrigatório");
      return;
    }

    try {
      this.racaModalLoading = true;
      let newRaca: Raca | undefined;

      if (this.isEditingRaca) {
        const response = await this.racaService.update(this.racaForm.racaId, {
          nome: this.racaForm.nome,
          ativo: this.racaForm.ativo,
        });
        newRaca = response.data;
      } else {
        const response = await this.racaService.create({
          nome: this.racaForm.nome,
        });
        newRaca = response.data;
      }

      if (this.caoEmAprovacao && newRaca && newRaca.racaId) {
        await firstValueFrom(
          this.cadastroCaoService.update(this.caoEmAprovacao.cadastroId, {
            racaId: newRaca.racaId,
            racaSugerida: null,
          } as any),
        );
        this.caoEmAprovacao = null;
        this.pendentesRacaOnly = true;
        await this.loadCaes();
      }

      await this.loadRacas();
      this.closeRacaModal();
    } catch (error) {
      console.error("Erro ao salvar raça:", error);
      alert("Erro ao salvar raça");
    } finally {
      this.racaModalLoading = false;
    }
  }

  aprovarRaca(cao: CaoListItem) {
    if (!cao.racaSugerida) {
      alert("Este cão não tem uma raça sugerida para aprovação.");
      return;
    }
    this.caoEmAprovacao = cao;
    this.resetRacaForm();
    this.racaForm.nome = cao.racaSugerida;
    this.isEditingRaca = false;
    this.openRacaModal();
  }

  async deleteRaca(raca: Raca) {
    if (!confirm(`Tem certeza que deseja excluir a raça "${raca.nome}"?`)) {
      return;
    }

    try {
      await this.racaService.delete(raca.racaId);
      await this.loadRacas();
    } catch (error) {
      console.error("Erro ao excluir raça:", error);
      alert("Erro ao excluir raça");
    }
  }

  navigateToCadastro() {
    this.router.navigate(["/cadastro-cao"]);
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  get isAdmin() {
    const user = this.authService.getCurrentUser();
    return user ? user.role === "ADMIN" || user.role === "EDITOR" : false;
  }

  get isSavingBreed() {
    return this.racaModalLoading;
  }

  get editingBreedId() {
    return this.isEditingRaca ? this.racaForm.racaId : null;
  }

  get currentBreed() {
    return this.racaForm;
  }

  get breedForm() {
    return {
      valid: this.racaForm.nome.trim().length > 0,
    };
  }

  cancelBreedEdit() {
    this.closeRacaModal();
  }

  closeBreedModal() {
    this.closeRacaModal();
  }

  saveBreed() {
    this.saveRaca();
  }

  get selectedBreedId() {
    return this.selectedRaca;
  }

  get showBreedModal() {
    return this.showRacaModal;
  }

  clearFilters() {
    this.searchTerm = "";
    this.selectedRaca = "";
    this.selectedStatus = "";
    this.loadCaes();
  }

  editBreed(raca: Raca) {
    this.editRaca(raca);
  }

  deleteBreed(raca: Raca) {
    this.deleteRaca(raca);
  }

  viewCao(cao: CaoListItem) {
    console.log("Visualizar cão:", cao);
  }

  editCao(cao: CaoListItem) {
    this.openCaoModal(cao);
  }

  openCaoModal(caoListItem: CaoListItem) {
    const cao: Cao = {
      cadastroId: caoListItem.cadastroId,
      userId: '',
      nome: caoListItem.nomeCao || caoListItem.nome || '',
      raca: caoListItem.raca?.nome,
      racaId: caoListItem.racaId,
      sexo: caoListItem.sexo,
      dataNascimento: caoListItem.dataNascimento,
      fotoPerfil: (caoListItem as any).fotoPerfil || '',
      fotoLateral: (caoListItem as any).fotoLateral || '',
      peso: undefined,
      altura: undefined,
      temPedigree: false,
      registroPedigree: caoListItem.registroPedigree,
      pedigreeFrente: (caoListItem as any).pedigreeFrente || undefined,
      pedigreeVerso: (caoListItem as any).pedigreeVerso || undefined,
      temMicrochip: false,
      numeroMicrochip: undefined,
      titulos: undefined,
      caracteristicas: undefined,
      videoOption: 'NONE',
      videoUrl: undefined,
      whatsappContato: undefined,
      observacoes: undefined,
      createdAt: caoListItem.createdAt,
      updatedAt: new Date(),
      status: caoListItem.status || 'CADASTRO_INCOMPLETO',
      motivoRejeicao: undefined,
      aprovadoPor: undefined,
      aprovadoEm: undefined,
      ativo: true,
      totalVotos: 0,
      nomeCao: caoListItem.nomeCao,
      donoCao: caoListItem.proprietario || caoListItem.donoCao,
      racaSugerida: caoListItem.racaSugerida,
      numeroRegistro: caoListItem.numeroRegistro,
    };
    this.selectedCao = cao;
    this.showCaoModal = true;
  }

  closeCaoModal() {
    this.showCaoModal = false;
    this.selectedCao = null;
  }

  async saveCao(updatedCao: Cao) {
    if (!updatedCao) return;

    try {
      // Evitar enviar imagens em base64 via JSON (causa PayloadTooLargeError)
      const payload: any = { ...updatedCao };
      const imageFields = [
        'fotoPerfil',
        'fotoLateral',
        'pedigreeFrente',
        'pedigreeVerso',
      ] as const;
      imageFields.forEach((field) => {
        const value = payload[field];
        // Remove data URLs (ex.: "data:image/png;base64,...") do payload de atualização
        if (typeof value === 'string' && /^data:image\//.test(value)) {
          delete payload[field];
        }
      });

      await firstValueFrom(
        this.cadastroCaoService.update(updatedCao.cadastroId, payload),
      );

      alert("Cão atualizado com sucesso!");
      this.closeCaoModal();
      await this.loadCaes();
    } catch (error) {
      console.error("Erro ao atualizar cão:", error);
      alert("Erro ao atualizar cão.");
    }
  }

  async aprovarCao(cao: CaoListItem) {
    try {
      const result = await firstValueFrom(
        this.cadastroCaoService.aprovarCadastro(cao.cadastroId),
      );
      alert(result?.mensagem || "Cadastro aprovado com sucesso");
      await this.loadCaes();
    } catch (error: any) {
      console.error("Erro ao aprovar cadastro:", error);
      alert(
        error?.error?.message || error?.message || "Erro ao aprovar cadastro",
      );
    }
  }

  async rejeitarCao(cao: CaoListItem) {
    const motivo = prompt("Informe o motivo da rejeição:");
    if (!motivo || !motivo.trim()) {
      alert("Motivo da rejeição é obrigatório");
      return;
    }
    try {
      const result = await firstValueFrom(
        this.cadastroCaoService.rejeitarCadastro(cao.cadastroId, motivo.trim()),
      );
      alert(result?.mensagem || "Cadastro rejeitado com sucesso");
      await this.loadCaes();
    } catch (error: any) {
      console.error("Erro ao rejeitar cadastro:", error);
      alert(
        error?.error?.message || error?.message || "Erro ao rejeitar cadastro",
      );
    }
  }

  isCaoPendente(cao: CaoListItem): boolean {
    return (cao.status as StatusCadastro) === "CADASTRO_INCOMPLETO";
  }

  async setCadastroIncompleto(cao: CaoListItem) {
    try {
      await firstValueFrom(
        this.cadastroCaoService.update(cao.cadastroId, {
          status: "CADASTRO_INCOMPLETO",
          motivoRejeicao: null,
        } as any),
      );
      alert("Status atualizado para incompleto");
      await this.loadCaes();
    } catch (error: any) {
      console.error("Erro ao definir cadastro incompleto:", error);
      alert(
        error?.error?.message || error?.message || "Erro ao atualizar status",
      );
    }
  }

  async onRowStatusChange(cao: CaoListItem, novoStatus: StatusCadastro) {
    // Mantém a UX consistente com as ações especializadas
    if (novoStatus === "APROVADO") {
      await this.aprovarCao(cao);
      return;
    }
    if (novoStatus === "REJEITADO") {
      await this.rejeitarCao(cao);
      return;
    }
    if (novoStatus === "CADASTRO_INCOMPLETO") {
      await this.setCadastroIncompleto(cao);
      return;
    }
  }
}
