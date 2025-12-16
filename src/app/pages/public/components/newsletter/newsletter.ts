import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.scss'
})
export class NewsletterComponent {
  constructor(private notificationService: NotificationService) {}

  assinarWhatsapp(phone: string): void {
    if (!phone || phone.length < 8) {
      this.notificationService.warning('Por favor, digite um número de WhatsApp válido.');
      return;
    }

    // Simulação de chamada de API (Bot)
    setTimeout(() => {
      this.notificationService.success('Sucesso! Em breve você receberá nossas novidades no WhatsApp.');
    }, 500);
  }
}
