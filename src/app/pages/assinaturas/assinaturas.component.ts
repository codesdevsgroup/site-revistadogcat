import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-assinaturas',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './assinaturas.component.html',
  styleUrl: './assinaturas.component.scss'
})
export class AssinaturasComponent {

}
