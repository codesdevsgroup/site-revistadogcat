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
import { NewsletterComponent } from '../components/newsletter/newsletter';
import { CategoriesComponent } from '../components/categories/categories';
import { FaqComponent } from '../components/faq/faq.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ArtigosComponent,
    FooterComponent,
    ExpoDogComponent,
    AnuncieAquiComponent,
    CountUpDirective,
    NewsletterComponent,
    CategoriesComponent,
    FaqComponent
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
      duration: 1000,
      once: true
    });
  }

  sejaAssinante() {
    this.notificationService.info('Funcionalidade de assinatura em breve! Entre em contato conosco pelo WhatsApp.');
  }

  verUltimaEdicao() {
    this.edicoesService.listarUltima().subscribe({
      next: (edicao) => {
        if (edicao && edicao.id) {
          this.router.navigate(['/edicoes', edicao.id, 'visualizar']);
        } else {
          this.router.navigate(['/edicoes']);
        }
      },
      error: () => {
        this.router.navigate(['/edicoes']);
      }
    });
  }
}
