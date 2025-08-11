import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-expo-dog',
  imports: [RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './expo-dog.component.html',
  styleUrl: './expo-dog.component.scss'
})
export class ExpoDogComponent {

}
