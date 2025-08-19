import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { SocialMediaService } from '../../services/social-media.service';

@Component({
  selector: 'app-expo-dog',
  imports: [RouterModule, FooterComponent],
  templateUrl: './expo-dog.component.html',
  styleUrl: './expo-dog.component.scss'
})
export class ExpoDogComponent {
  socialMedia: any;

  constructor(private socialMediaService: SocialMediaService) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }
}
