import { Component } from '@angular/core';
import { DestaqueEdicaoComponent } from '../../../components/destaque-edicao/destaque-edicao';
import { FooterComponent } from '../../../components/footer/footer';
import { ExpoDogComponent } from '../../../components/expo-dog/expo-dog';
import { AnuncieAquiComponent } from '../../../components/anuncie-aqui/anuncie-aqui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DestaqueEdicaoComponent,
    FooterComponent,
    ExpoDogComponent,
    AnuncieAquiComponent // Corrigido para o novo componente
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

