import { Component, OnInit } from '@angular/core';
import { ArtigosComponent } from '../components/destaque-edicao/artigos';
import { FooterComponent } from '../components/footer/footer';
import { ExpoDogComponent } from '../components/expo-dog/expo-dog';
import { AnuncieAquiComponent } from '../components/anuncie-aqui/anuncie-aqui';
import { CountUpDirective } from '../../../components/directives/count-up.directive';
import { Router } from '@angular/router';
import { EdicoesService } from '../../../services/edicoes.service';
import { NotificationService } from '../../../services/notification.service';
import AOS from 'aos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ArtigosComponent,
    FooterComponent,
    ExpoDogComponent,
    AnuncieAquiComponent,
    CountUpDirective
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class HomeComponent implements OnInit {
  socialMedia = {
    instagram: '@revistadogcat',
    facebook: '@dogcatbr',
    tiktok: '@dogcatbr'
  };

  constructor(
    private edicoesService: EdicoesService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  // Inicializa AOS (Animate On Scroll) para animações de entrada suaves nos blocos da Home
  ngOnInit(): void {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }

  sejaAssinante(): void {
    const message = 'Estamos finalizando os planos de assinatura. Aproveite! Todo o conteúdo do site está disponível gratuitamente por tempo limitado.';
    // Usando window.alert ou serviço de notificação se preferir um modal mais bonito depois
    // this.notificationService.info(message);
    // Como o user pediu "um modal, aviso", e o notificationService é um toaster,
    // um alert nativo é mais intrusivo como "aviso", ou podemos usar o notificationService com duração longa.
    // O user disse "modal, aviso", vou usar o notificationService.info que é mais elegante,
    // mas se ele quiser um modal real, precisaria criar um componente.
    // Dado o contexto "aviso", o toaster info serve bem.
    this.notificationService.info(message);
  }

  verUltimaEdicao(): void {
    this.edicoesService.listarUltima().subscribe({
      next: (edicao) => {
        if (edicao && edicao.id) {
          this.router.navigate(['/edicoes', edicao.id, 'visualizar']);
        } else {
          this.notificationService.warning('Nenhuma edição disponível no momento.');
          this.router.navigate(['/edicoes']);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar última edição', err);
        // Fallback para a lista
        this.router.navigate(['/edicoes']);
      }
    });
  }
}

