import { Component } from '@angular/core';
import { ModalCadastroAnuncianteComponent } from '../modal-cadastro-anunciante/modal-cadastro-anunciante.component';
import { SocialMediaService } from '../../services/social-media.service';

@Component({
  selector: 'app-top-canis-gatis',
  imports: [ModalCadastroAnuncianteComponent],
  templateUrl: './top-canis-gatis.component.html',
  styleUrl: './top-canis-gatis.component.scss'
})
export class TopCanisGatisComponent {
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
