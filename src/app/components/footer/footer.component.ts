import { Component } from '@angular/core';
import { SocialMediaService } from '../../services/social-media.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  socialMedia: any;

  constructor(private socialMediaService: SocialMediaService) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }
}
