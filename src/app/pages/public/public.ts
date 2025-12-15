import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { WhatsappFloatComponent } from './components/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, WhatsappFloatComponent],
  template: `
    <app-navbar />
    <div class="main-content with-navbar">
      <router-outlet />
    </div>
    <app-whatsapp-float />
  `,
  styles: [
    `
    .main-content.with-navbar {
      padding-top: var(--navbar-height);
    }
    `
  ]
})
export class PublicComponent {
  constructor() {}
}