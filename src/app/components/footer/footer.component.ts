import { Component } from '@angular/core';
import { SocialMediaService } from '../../services/social-media.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  socialMedia: any;

  constructor(private socialMediaService: SocialMediaService) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }
}

