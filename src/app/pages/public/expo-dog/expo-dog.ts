import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer';
import { SocialMediaService } from '../../../services/social-media.service';

@Component({
  selector: 'app-expo-dog',
  imports: [RouterModule, FooterComponent],
  templateUrl: './expo-dog.html',
  styleUrl: './expo-dog.scss'
})
export class ExpoDogComponent {
  
  socialMedia: any;

  constructor(
    private socialMediaService: SocialMediaService,
    private router: Router
  ) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }
  
  /**
   * Redireciona para o cadastro de cão (sem verificação de login)
   */
  onCadastrarCaoClick(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/cadastro-cao']);
  }
}

