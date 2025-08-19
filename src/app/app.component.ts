import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar.component';
import {WhatsappFloatComponent} from './components/whatsapp-float/whatsapp-float.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, WhatsappFloatComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'site-revistadogcat';
}
