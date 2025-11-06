import { Component, OnInit } from '@angular/core';
import { ArtigosComponent } from '../components/destaque-edicao/artigos';
import { FooterComponent } from '../components/footer/footer';
import { ExpoDogComponent } from '../components/expo-dog/expo-dog';
import { AnuncieAquiComponent } from '../components/anuncie-aqui/anuncie-aqui';
import { CountUpDirective } from '../../../components/directives/count-up.directive';
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

  // Inicializa AOS (Animate On Scroll) para animações de entrada suaves nos blocos da Home
  ngOnInit(): void {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }
}

