import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { CadastroCao } from '../../services/cadastro-cao.service';
import { CaoService } from '../../services/cao.service';
import { NotificationService } from '../../services/notification.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-dog-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    CheckboxModule
  ],
  templateUrl: './dog-details-modal.html',
  styleUrls: []
})
export class DogDetailsModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() dog: CadastroCao | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() requestPayment = new EventEmitter<CadastroCao>();
  @Output() dogUpdated = new EventEmitter<CadastroCao>();

  isEditing = false;
  editForm: FormGroup;
  racas: { id: string; nome: string }[] = [];
  isSubmitting = false;

  selectedFotoPerfil: File | null = null;
  selectedFotoLateral: File | null = null;
  selectedPedigreeFrente: File | null = null;
  selectedPedigreeVerso: File | null = null;

  constructor(
    private fb: FormBuilder,
    private caoService: CaoService,
    private notificationService: NotificationService
  ) {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      raca: ['', Validators.required],
      racaSugerida: [''],
      sexo: ['', Validators.required],
      dataNascimento: [null, Validators.required],
      peso: [''],
      altura: [''],
      temPedigree: [false],
      registroPedigree: [''],
      entidadeEmissoraPedigree: [''],
      temMicrochip: [false],
      numeroMicrochip: [''],
      titulos: [''],
      caracteristicas: [''],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.loadRacas();
    this.setupConditionalValidators();
  }

  get isOutraRacaSelected(): boolean {
    const racaId = this.editForm.get('raca')?.value;
    if (!racaId) return false;
    const selectedRaca = this.racas.find(r => r.id === racaId);
    return selectedRaca?.nome === 'Outra';
  }

  loadRacas() {
    this.caoService.getRacas().subscribe({
      next: (data) => {
        this.racas = data.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (err) => console.error('Erro ao carregar raças', err)
    });
  }

  setupConditionalValidators() {
    this.editForm.get('temPedigree')?.valueChanges.subscribe(hasPedigree => {
      const registro = this.editForm.get('registroPedigree');
      const entidade = this.editForm.get('entidadeEmissoraPedigree');
      if (hasPedigree) {
        registro?.setValidators(Validators.required);
        entidade?.setValidators(Validators.required);
      } else {
        registro?.clearValidators();
        entidade?.clearValidators();
      }
      registro?.updateValueAndValidity();
      entidade?.updateValueAndValidity();
    });

    this.editForm.get('temMicrochip')?.valueChanges.subscribe(hasMicrochip => {
      const microchip = this.editForm.get('numeroMicrochip');
      if (hasMicrochip) {
        microchip?.setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      } else {
        microchip?.clearValidators();
      }
      microchip?.updateValueAndValidity();
    });

    this.editForm.get('raca')?.valueChanges.subscribe(racaId => {
       const selectedRaca = this.racas.find(r => r.id === racaId);
       const racaSugerida = this.editForm.get('racaSugerida');
       if (selectedRaca?.nome === 'Outra') {
         racaSugerida?.setValidators([Validators.required, Validators.minLength(3)]);
       } else {
         racaSugerida?.clearValidators();
       }
       racaSugerida?.updateValueAndValidity();
    });
  }

  enableEdit() {
    if (!this.dog) return;
    this.isEditing = true;

    let racaValue = '';
    if (this.dog.racaId) {
        racaValue = this.dog.racaId;
    } else if (this.dog.raca) {
        const found = this.racas.find(r => r.nome === this.dog!.raca);
        if (found) racaValue = found.id;
    }

    this.editForm.patchValue({
      nome: this.dog.nome,
      raca: racaValue,
      racaSugerida: this.dog.racaSugerida,
      sexo: this.dog.sexo,
      dataNascimento: this.dog.dataNascimento ? new Date(this.dog.dataNascimento) : null,
      peso: this.dog.peso,
      altura: this.dog.altura,
      temPedigree: this.dog.temPedigree,
      registroPedigree: this.dog.registroPedigree,
      entidadeEmissoraPedigree: this.dog.entidadeEmissoraPedigree,
      temMicrochip: this.dog.temMicrochip,
      numeroMicrochip: this.dog.numeroMicrochip,
      titulos: this.dog.titulos,
      caracteristicas: this.dog.caracteristicas,
      observacoes: this.dog.observacoes
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editForm.reset();
    this.selectedFotoPerfil = null;
    this.selectedFotoLateral = null;
    this.selectedPedigreeFrente = null;
    this.selectedPedigreeVerso = null;
  }

  onFileSelected(event: any, type: 'fotoPerfil' | 'fotoLateral' | 'pedigreeFrente' | 'pedigreeVerso') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'fotoPerfil') this.selectedFotoPerfil = file;
      else if (type === 'fotoLateral') this.selectedFotoLateral = file;
      else if (type === 'pedigreeFrente') this.selectedPedigreeFrente = file;
      else if (type === 'pedigreeVerso') this.selectedPedigreeVerso = file;
    }
  }

  saveChanges() {
    if (this.editForm.invalid || !this.dog) {
        this.editForm.markAllAsTouched();
        return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const values = this.editForm.value;

    Object.keys(values).forEach(key => {
        let value = values[key];
        if (value instanceof Date) {
            value = value.toISOString().split('T')[0];
        }
        if (value !== null && value !== undefined && value !== '') {
            if (key === 'raca') {
                 formData.append('racaId', value);
            } else {
                 formData.append(key, value);
            }
        }
    });

    if (this.selectedFotoPerfil) formData.append('fotoPerfil', this.selectedFotoPerfil);
    if (this.selectedFotoLateral) formData.append('fotoLateral', this.selectedFotoLateral);
    if (this.selectedPedigreeFrente) formData.append('pedigreeFrente', this.selectedPedigreeFrente);
    if (this.selectedPedigreeVerso) formData.append('pedigreeVerso', this.selectedPedigreeVerso);

    this.caoService.atualizarCaoUnificado(this.dog.cadastroId, formData).subscribe({
        next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.Response) {
                this.notificationService.success('Cão atualizado com sucesso!');
                this.isEditing = false;
                if (event.body && event.body.data) {
                    this.dogUpdated.emit(event.body.data);
                    this.dog = { ...this.dog!, ...event.body.data };
                }
                this.isSubmitting = false;
            }
        },
        error: (err) => {
            console.error('Erro ao atualizar', err);
            this.notificationService.error('Erro ao atualizar cão.');
            this.isSubmitting = false;
        }
    });
  }

  close(): void {
    this.isEditing = false;
    this.closeModal.emit();
  }

  onPagar(): void {
    if (this.dog) {
      this.requestPayment.emit(this.dog);
    }
  }

  getIdade(dataNascimento: Date | string | undefined): string {
    if (!dataNascimento) return 'Data não informada';
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      anos--;
    }
    if (anos === 0) {
      let meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12;
      meses -= nascimento.getMonth();
      meses += hoje.getMonth();
      if (hoje.getDate() < nascimento.getDate()) {
        meses--;
      }
      return `${meses} meses`;
    }
    return `${anos} anos`;
  }
}
