import { Component } from '@angular/core';
import { ArtigosComponent } from '../components/destaque-edicao/artigos';
import { FooterComponent } from '../components/footer/footer';
import { ExpoDogComponent } from '../components/expo-dog/expo-dog';
import { AnuncieAquiComponent } from '../components/anuncie-aqui/anuncie-aqui';
import { CountUpDirective } from '../../../components/directives/count-up.directive';

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

export class HomeComponent {
  socialMedia = {
    instagram: '@revistadogcat',
    facebook: '@dogcatbr',
    tiktok: '@dogcatbr'
  };
}

