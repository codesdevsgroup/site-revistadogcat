import { Component } from '@angular/core';
import {DestaqueEdicaoComponent} from '../../components/destaque-edicao/destaque-edicao.component';
import {FooterComponent} from '../../components/footer/footer.component';
import {ExpoDogComponent} from '../../components/expo-dog/expo-dog.component';
import {TopCanisGatisComponent} from '../../components/top-canis-gatis/top-canis-gatis.component';

@Component({
  selector: 'app-home',
  imports: [
    DestaqueEdicaoComponent,
    FooterComponent,
    ExpoDogComponent,
    TopCanisGatisComponent
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
