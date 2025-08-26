import { Component } from '@angular/core';
import { NewsletterComponent } from '../newsletter/newsletter';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NewsletterComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  socialMedia = {
    instagram: {
      username: 'revistadogcat',
      url: 'https://www.instagram.com/revistadogcat/',
      displayName: 'Instagram/revistadogcat'
    },
    facebook: {
      username: 'dogcatbr',
      url: 'https://www.facebook.com/profile.php?id=61576202886357',
      displayName: 'Facebook/dogcatbr'
    },
    tiktok: {
      username: 'dogcatbr',
      url: '#',
      displayName: 'TikTok/dogcatbr'
    },
    whatsapp: {
      number: '5515998350750',
      url: 'https://wa.me/5515998350750',
      displayName: 'WhatsApp',
      formattedNumber: '(15) 99835-0750'
    }
  };

  constructor() {}
}

