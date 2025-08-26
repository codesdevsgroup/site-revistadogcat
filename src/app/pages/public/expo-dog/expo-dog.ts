import { Component, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer';
import { SocialMediaService } from '../../../services/social-media.service';
import { AuthService } from '../../../services/auth.service';
import { LoginRequiredModalComponent } from '../components/login-required-modal/login-required-modal.component';

@Component({
  selector: 'app-expo-dog',
  imports: [RouterModule, FooterComponent, LoginRequiredModalComponent],
  templateUrl: './expo-dog.html',
  styleUrl: './expo-dog.scss'
})
export class ExpoDogComponent {
  @ViewChild(LoginRequiredModalComponent) loginRequiredModal!: LoginRequiredModalComponent;
  
  socialMedia: any;

  constructor(
    private socialMediaService: SocialMediaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }
  
  /**
   * Verifica se o usuário está logado antes de permitir o cadastro do cão
   */
  onCadastrarCaoClick(event: Event): void {
    event.preventDefault();
    
    if (this.authService.isAuthenticated()) {
      // Usuário está logado, pode prosseguir para o cadastro
      this.router.navigate(['/cadastro-cao']);
    } else {
      // Usuário não está logado, exibe o modal
      this.loginRequiredModal.show();
    }
  }
}

