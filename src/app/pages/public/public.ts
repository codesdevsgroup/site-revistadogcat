import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { WhatsappFloatComponent } from '../../components/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, WhatsappFloatComponent],
  template: `
    <app-navbar />
    <div class="main-content with-navbar">
      <router-outlet />
    </div>
    <app-whatsapp-float />
  `,
  styles: []
})
export class PublicComponent {
  constructor() {}
}