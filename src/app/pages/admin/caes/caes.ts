import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CadastroCaoService, StatusCadastro } from '../../../services/cadastro-cao.service';
import { RacaService } from '../../../services/raca.service';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

// Usando a interface do serviço e estendendo com propriedades necessárias
interface CaoListItem {
  cadastroCaoId: string;
  nomeCao: string;
  raca: {
    nome: string;
  };
  dataNascimento: string;
  sexo: string;
  proprietario: {
    nome: string;
  };
  createdAt: string;
  // Propriedades adicionais para compatibilidade com o template
  nome?: string;
  numeroRegistro?: string;
  racaId?: string;
  donoCao?: {
    nome: string;
  };
  fotos?: string[];
  status?: StatusCadastro;
}

interface Raca {
  racaId: string;
  id?: string; // Alias para racaId
  nome: string;
  descricao?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-caes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caes.html',
  styleUrls: ['./caes.scss']
})
export class CaesComponent implements OnInit {
  caes: CaoListItem[] = [];
  racas: Raca[] = [];
  filteredRacas: Raca[] = [];
  loading = false;
  searchTerm = '';
  selectedRaca = '';
  pendentesOnly = false; // Filtro para cadastros pendentes de aprovação
  
  // Modal de raças
  showRacaModal = false;
  racaSearchTerm = '';
  racaForm = {
    racaId: '',
    nome: '',
    descricao: '',
    ativo: true
  };
  isEditingRaca = false;
  racaModalLoading = false;

  constructor(
    private cadastroCaoService: CadastroCaoService,
    private racaService: RacaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCaes();
    this.loadRacas();
  }

  async loadCaes() {
    try {
      this.loading = true;
      let data: any[] = [];
      if (this.pendentesOnly) {
        const result = await firstValueFrom(
          this.cadastroCaoService.listar({ pendentesValidacao: 'true', status: 'PENDENTE' as StatusCadastro })
        );
        data = result || [];
      } else {
        const response = await this.cadastroCaoService.findAll();
        data = response.data || response || [];
      }

      // Mapear os dados para incluir propriedades necessárias
      this.caes = (data || []).map((cao: any) => ({
        ...cao,
        nome: cao.nomeCao ?? cao.nome,
        donoCao: cao.proprietario ?? cao.donoCao,
        fotos: cao.fotos ?? [],
        racaId: cao.racaId,
        numeroRegistro: cao.numeroRegistro,
        status: cao.status as StatusCadastro
      }));
    } catch (error) {
      console.error('Erro ao carregar cães:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadRacas() {
    try {
      const response = await this.racaService.findAll();
      this.racas = (response.data || [])
        .map(raca => ({
          ...raca,
          id: raca.racaId // Alias para compatibilidade
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome)); // Ordenação alfabética
      
      this.updateFilteredRacas();
    } catch (error) {
      console.error('Erro ao carregar raças:', error);
    }
  }

  filterCaes() {
    // Implementar filtro se necessário
    console.log('Filtrar cães por raça:', this.selectedBreedId);
  }

  updateFilteredRacas() {
    if (!this.racaSearchTerm.trim()) {
      this.filteredRacas = [...this.racas];
    } else {
      const searchTerm = this.racaSearchTerm.toLowerCase().trim();
      this.filteredRacas = this.racas.filter(raca =>
        raca.nome.toLowerCase().includes(searchTerm)
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
    return this.caes.filter(cao => {
      const matchesSearch = !this.searchTerm || 
        (cao.nomeCao || cao.nome || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (cao.proprietario?.nome || cao.donoCao?.nome || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRaca = !this.selectedRaca || cao.raca.nome === this.selectedRaca;
      
      return matchesSearch && matchesRaca;
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  calculateAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} ${ageInMonths === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  }

  formatAge(birthDate: string): string {
    return this.calculateAge(birthDate);
  }

  getRacaName(racaId?: string): string {
    if (!racaId) return 'N/A';
    const raca = this.racas.find(r => r.racaId === racaId);
    return raca ? raca.nome : 'N/A';
  }

  // Métodos do modal de raças
  openRacaModal() {
    this.showRacaModal = true;
    this.racaSearchTerm = ''; // Limpa o filtro ao abrir o modal
    this.resetRacaForm();
    this.updateFilteredRacas(); // Atualiza a lista filtrada
  }

  closeRacaModal() {
    this.showRacaModal = false;
    this.resetRacaForm();
  }

  resetRacaForm() {
    this.racaForm = {
      racaId: '',
      nome: '',
      descricao: '',
      ativo: true
    };
    this.isEditingRaca = false;
  }

  editRaca(raca: Raca) {
    this.racaForm = { 
      racaId: raca.racaId,
      nome: raca.nome,
      descricao: raca.descricao || '',
      ativo: raca.ativo
    };
    this.isEditingRaca = true;
    this.showRacaModal = true;
  }

  async saveRaca() {
    if (!this.racaForm.nome.trim()) {
      alert('Nome da raça é obrigatório');
      return;
    }

    try {
      this.racaModalLoading = true;
      
      if (this.isEditingRaca) {
        await this.racaService.update(this.racaForm.racaId, {
          nome: this.racaForm.nome,
          ativo: this.racaForm.ativo
        });
      } else {
        await this.racaService.create({
          nome: this.racaForm.nome
        });
      }
      
      await this.loadRacas();
      this.closeRacaModal();
    } catch (error) {
      console.error('Erro ao salvar raça:', error);
      alert('Erro ao salvar raça');
    } finally {
      this.racaModalLoading = false;
    }
  }

  async deleteRaca(raca: Raca) {
    if (!confirm(`Tem certeza que deseja excluir a raça "${raca.nome}"?`)) {
      return;
    }

    try {
      await this.racaService.delete(raca.racaId);
      await this.loadRacas();
    } catch (error) {
      console.error('Erro ao excluir raça:', error);
      alert('Erro ao excluir raça');
    }
  }

  navigateToCadastro() {
    this.router.navigate(['/cadastro-cao']);
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  get isAdmin() {
    const user = this.authService.getCurrentUser();
    return user ? (user.role === 'ADMIN' || user.role === 'EDITOR') : false;
  }

  // Aliases para compatibilidade com o template
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
      valid: this.racaForm.nome.trim().length > 0
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
    this.searchTerm = '';
    this.selectedRaca = '';
  }

  editBreed(raca: Raca) {
    this.editRaca(raca);
  }

  deleteBreed(raca: Raca) {
    this.deleteRaca(raca);
  }

  viewCao(cao: CaoListItem) {
    // Implementar visualização do cão
    console.log('Visualizar cão:', cao);
  }

  editCao(cao: CaoListItem) {
    // Navegar para edição do cão
    this.router.navigate(['/cadastro-cao'], { queryParams: { id: cao.cadastroCaoId } });
  }

  async deleteCao(cao: CaoListItem) {
    if (!confirm(`Tem certeza que deseja excluir o cão "${cao.nomeCao}"?`)) {
      return;
    }

    try {
      await this.cadastroCaoService.delete(cao.cadastroCaoId);
      await this.loadCaes();
    } catch (error) {
      console.error('Erro ao excluir cão:', error);
      alert('Erro ao excluir cão');
    }
  }

  // Ações de aprovação/rejeição de cadastro pendente
  async aprovarCao(cao: CaoListItem) {
    try {
      const result = await firstValueFrom(this.cadastroCaoService.aprovarCadastro(cao.cadastroCaoId));
      alert(result?.mensagem || 'Cadastro aprovado com sucesso');
      if (this.pendentesOnly) {
        this.caes = this.caes.filter(c => c.cadastroCaoId !== cao.cadastroCaoId);
      } else {
        const item = this.caes.find(c => c.cadastroCaoId === cao.cadastroCaoId);
        if (item) {
          (item as any).status = 'APROVADO';
        }
      }
    } catch (error: any) {
      console.error('Erro ao aprovar cadastro:', error);
      alert(error?.error?.message || error?.message || 'Erro ao aprovar cadastro');
    }
  }

  async rejeitarCao(cao: CaoListItem) {
    const motivo = prompt('Informe o motivo da rejeição:');
    if (!motivo || !motivo.trim()) {
      alert('Motivo da rejeição é obrigatório');
      return;
    }
    try {
      const result = await firstValueFrom(this.cadastroCaoService.rejeitarCadastro(cao.cadastroCaoId, motivo.trim()));
      alert(result?.mensagem || 'Cadastro rejeitado com sucesso');
      if (this.pendentesOnly) {
        this.caes = this.caes.filter(c => c.cadastroCaoId !== cao.cadastroCaoId);
      } else {
        const item = this.caes.find(c => c.cadastroCaoId === cao.cadastroCaoId);
        if (item) {
          (item as any).status = 'REJEITADO';
        }
      }
    } catch (error: any) {
      console.error('Erro ao rejeitar cadastro:', error);
      alert(error?.error?.message || error?.message || 'Erro ao rejeitar cadastro');
    }
  }

  isCaoPendente(cao: CaoListItem): boolean {
    return (cao.status as StatusCadastro) === 'PENDENTE';
  }
}