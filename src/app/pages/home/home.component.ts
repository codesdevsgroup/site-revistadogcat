import { Component } from '@angular/core';
import {DestaqueEdicaoComponent} from '../../components/destaque-edicao/destaque-edicao.component';
import {FooterComponent} from '../../components/footer/footer.component';
import {MetricsComponent} from '../../components/metrics/metrics.component';

@Component({
  selector: 'app-home',
  imports: [
    DestaqueEdicaoComponent,
    FooterComponent,
    MetricsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  socialMedia = {
    instagram: '@dogcatbr_instagram',
    facebook: '@dogcatbr_facebook',
    tiktok: '@dogcatbr_tiktok'
  };
}
