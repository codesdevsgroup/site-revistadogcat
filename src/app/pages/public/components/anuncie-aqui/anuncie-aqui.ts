import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCadastroAnuncianteComponent } from '../modal-cadastro-anunciante/modal-cadastro-anunciante';

@Component({
  selector: 'app-anuncie-aqui',
  standalone: true,
  imports: [CommonModule, ModalCadastroAnuncianteComponent],
  templateUrl: './anuncie-aqui.html',
  styleUrl: './anuncie-aqui.scss'
})
export class AnuncieAquiComponent {
  socialMedia = {
    whatsapp: {
      number: '5515998350750',
      url: 'https://wa.me/5515998350750',
      displayName: 'WhatsApp',
      formattedNumber: '(15) 99835-0750'
    }
  };
  whatsappData = this.socialMedia.whatsapp;
  isModalOpen = false;

  constructor() {}

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
