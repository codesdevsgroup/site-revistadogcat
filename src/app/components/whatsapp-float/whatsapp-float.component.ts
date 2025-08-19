import { Component } from '@angular/core';
import { SocialMediaService } from '../../services/social-media.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-float',
  imports: [CommonModule],
  templateUrl: './whatsapp-float.component.html',
  styleUrl: './whatsapp-float.component.scss'
})
export class WhatsappFloatComponent {
  whatsappData: any;

  constructor(private socialMediaService: SocialMediaService) {
    this.whatsappData = this.socialMediaService.getWhatsApp();
  }

  openWhatsApp() {
    const message = 'Olá! Gostaria de saber mais sobre a Revista Dog & Cat BR.';
    const url = this.socialMediaService.getWhatsAppUrl(message);
    window.open(url, '_blank');
  }
}