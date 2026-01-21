import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { CadastroCao } from '../../services/cadastro-cao.service';

@Component({
  selector: 'app-dog-details-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule],
  templateUrl: './dog-details-modal.html',
  styleUrls: []
})
export class DogDetailsModalComponent {
  @Input() isOpen = false;
  @Input() dog: CadastroCao | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() requestPayment = new EventEmitter<CadastroCao>();
  @Output() editDog = new EventEmitter<CadastroCao>();

  close(): void {
    this.closeModal.emit();
  }

  onPagar(): void {
    if (this.dog) {
      this.requestPayment.emit(this.dog);
    }
  }

  onEdit(): void {
    if (this.dog) {
      this.editDog.emit(this.dog);
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
      // Menos de 1 ano, mostrar meses
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
