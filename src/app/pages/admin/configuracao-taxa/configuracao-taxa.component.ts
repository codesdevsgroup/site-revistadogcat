import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConfiguracaoService } from '../../../services/configuracao.service';
import { ConfiguracaoResponse } from '../../../interfaces';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracao-taxa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './configuracao-taxa.component.html',
  styleUrls: ['./configuracao-taxa.component.scss']
})
export class ConfiguracaoTaxaComponent implements OnInit {
  configuracaoForm: FormGroup;
  isLoading = false;
  isSaving = false;
  valorAtual: number = 0;

  constructor(
    private fb: FormBuilder,
    private configuracaoService: ConfiguracaoService,
    private notificationService: NotificationService
  ) {
    this.configuracaoForm = this.fb.group({
      taxaCadastro: ['0,00', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarConfiguracao();
  }

  carregarConfiguracao() {
    this.isLoading = true;
    this.configuracaoService.obterTaxaCadastro().subscribe({
      next: (config) => {
        // Valor vem em centavos, converter para reais
        this.valorAtual = config.valor;
        const valorEmReais = config.valor / 100;
        this.configuracaoForm.patchValue({
          taxaCadastro: valorEmReais.toFixed(2).replace('.', ',')
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar configuração:', error);
        this.notificationService.error('Erro ao carregar configuração');
        this.isLoading = false;
      }
    });
  }

  salvar() {
    if (this.configuracaoForm.invalid) {
      this.notificationService.error('Preencha todos os campos corretamente');
      return;
    }

    this.isSaving = true;
    let { taxaCadastro } = this.configuracaoForm.value;

    // Se for string, substitui vírgula por ponto. Se já for número, mantém.
    if (typeof taxaCadastro === 'string') {
      taxaCadastro = parseFloat(taxaCadastro.replace(/\./g, '').replace(',', '.'));
    }

    if (isNaN(taxaCadastro) || taxaCadastro < 0) {
      this.notificationService.error('Valor inválido');
      this.isSaving = false;
      return;
    }

    // Converter de reais para centavos
    const valorEmCentavos = Math.round(taxaCadastro * 100);

    this.configuracaoService.atualizarTaxaCadastro(valorEmCentavos).subscribe({
      next: (config) => {
        this.valorAtual = parseInt(config.valor, 10);
        this.notificationService.success('Configuração salva com sucesso!');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
        this.notificationService.error('Erro ao salvar configuração');
        this.isSaving = false;
      }
    });
  }

  get valorFormatado(): string {
    return `R$ ${(this.valorAtual / 100).toFixed(2).replace('.', ',')}`;
  }
}
