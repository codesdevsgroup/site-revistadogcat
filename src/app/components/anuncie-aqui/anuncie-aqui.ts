import { Component } from '@angular/core';
import { ModalCadastroAnuncianteComponent } from '../modal-cadastro-anunciante/modal-cadastro-anunciante';
import { SocialMediaService } from '../../services/social-media.service';

@Component({
  selector: 'app-anuncie-aqui',
  standalone: true,
  imports: [ModalCadastroAnuncianteComponent],
  templateUrl: './anuncie-aqui.html',
  styleUrl: './anuncie-aqui.scss'
})
export class AnuncieAquiComponent {
  socialMedia: any;
  isModalOpen = false;

  constructor(private socialMediaService: SocialMediaService) {
    this.socialMedia = this.socialMediaService.getSocialMedia();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onFormSubmit(formData: any) {
    console.log('Dados do formulário:', formData);
    // Aqui você pode integrar com um serviço para enviar os dados
  }
}
