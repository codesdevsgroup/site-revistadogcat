import { Component } from '@angular/core';
import { SocialMediaService } from '../../services/social-media.service';
import { NewsletterComponent } from '../newsletter/newsletter';

@Component({
  selector: 'app-footer',
  imports: [NewsletterComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  socialMedia: any;

  constructor(private socialMediaService: SocialMediaService) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }
}

