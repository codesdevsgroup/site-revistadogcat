import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-expo-dog',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './expo-dog.component.html',
  styleUrl: './expo-dog.component.scss'
})
export class ExpoDogComponent {

}
