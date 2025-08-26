import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-float.html',
  styleUrl: './whatsapp-float.scss'
})
export class WhatsappFloatComponent {
  whatsappData = {
    number: '5515998350750',
    url: 'https://wa.me/5515998350750',
    displayName: 'WhatsApp',
    formattedNumber: '(15) 99835-0750'
  };

  constructor() {}

  openWhatsApp() {
    const message = 'Olá! Gostaria de saber mais sobre a Revista Dog & Cat BR.';
    const encodedMessage = encodeURIComponent(message);
    const url = `${this.whatsappData.url}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }
}