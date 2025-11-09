import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

export interface Raca {
  racaId: string;
  id?: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-raca-manage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    TableModule,
  ],
  templateUrl: './raca-manage-dialog.component.html',
  styleUrls: ['./raca-manage-dialog.component.scss'],
})
export class RacaManageDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() racas: Raca[] = [];
  @Input() currentBreed: { racaId?: string; nome: string; descricao?: string; ativo: boolean } = { nome: '', ativo: true };
  @Input() isSavingBreed = false;
  @Input() editingBreedId: string | null = null;
  @Input() racaSearchTerm = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Raca>();
  @Output() delete = new EventEmitter<Raca>();
  @Output() racaSearchTermChange = new EventEmitter<string>();

  get filteredRacas(): Raca[] {
    const term = (this.racaSearchTerm || '').trim().toLowerCase();
    if (!term) return [...this.racas];
    return this.racas.filter((r) => r.nome.toLowerCase().includes(term));
  }

  onHide() {
    this.visibleChange.emit(false);
  }
}