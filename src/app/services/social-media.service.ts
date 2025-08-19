import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private readonly socialMedia = {
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

  getSocialMedia() {
    return this.socialMedia;
  }

  getInstagram() {
    return this.socialMedia.instagram;
  }

  getFacebook() {
    return this.socialMedia.facebook;
  }

  getTikTok() {
    return this.socialMedia.tiktok;
  }

  getWhatsApp() {
    return this.socialMedia.whatsapp;
  }

  getWhatsAppUrl(message?: string) {
    const baseUrl = this.socialMedia.whatsapp.url;
    if (message) {
      return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }
    return baseUrl;
  }
}