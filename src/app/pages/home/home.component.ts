import { Component } from '@angular/core';
import { DestaqueEdicaoComponent } from '../../components/destaque-edicao/destaque-edicao.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ExpoDogComponent } from '../../components/expo-dog/expo-dog.component';
import { AnuncieAquiComponent } from '../../components/anuncie-aqui/anuncie-aqui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DestaqueEdicaoComponent,
    FooterComponent,
    ExpoDogComponent,
    AnuncieAquiComponent // Corrigido para o novo componente
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  socialMedia = {
    instagram: '@revistadogcat',
    facebook: '@dogcatbr',
    tiktok: '@dogcatbr'
  };
}
