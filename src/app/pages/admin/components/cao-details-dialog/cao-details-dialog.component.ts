import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AdminCao as Cao, AdminRaca as Raca } from 'src/app/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-cao-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    ToggleSwitchModule,
    DatePickerModule,
    FileUploadModule
  ],
  templateUrl: './cao-details-dialog.component.html',
  styleUrls: ['./cao-details-dialog.component.scss']
})
export class CaoDetailsDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() cao: Cao | null = null;
  @Input() racas: Raca[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Cao>();
  @Output() cancel = new EventEmitter<void>();

  isEditing: boolean = false;
  originalCao: Cao | null = null;

  videoOptions: SelectItem[] = [
    { label: 'Nenhum', value: 'NONE' },
    { label: 'URL Externa', value: 'URL' },
    { label: 'Upload de Arquivo', value: 'UPLOAD' }
  ];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cao'] && this.cao) {
      this.originalCao = { ...this.cao };
      this.isEditing = false;
    }
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.isEditing = false;
    this.cao = null;
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async onSingleImageSelect(files: File[], target: 'fotoLateral' | 'fotoPerfil' | 'pedigreeFrente' | 'pedigreeVerso'): Promise<void> {
    if (!this.cao || !files?.length) return;
    const preview = await this.readFileAsDataURL(files[0]);
    this.cao[target] = preview;
  }

  onFileSelected(event: any): void {
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) return;
    console.log('Vídeo selecionado:', file.name, file.type, file.size);
  }

  saveCao(): void {
    if (this.cao) {
      this.save.emit(this.cao);
      this.isEditing = false;
    }
  }

  cancelEdit(): void {
    if (this.isEditing && this.originalCao) {
      this.cao = { ...this.originalCao };
      this.isEditing = false;
    } else {
      this.onHide();
    }
    this.cancel.emit();
  }
}
