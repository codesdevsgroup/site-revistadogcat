import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  faqItems = [
    {
      question: 'Como funcionam as assinaturas?',
      answer: 'Você pode assinar o plano mensal ou anual, com acesso total às edições digitais, conteúdos exclusivos e descontos em parceiros. O cancelamento pode ser feito a qualquer momento sem multa.',
      isOpen: false
    },
    {
      question: 'O que é o Expo Dog BR?',
      answer: 'É um espaço exclusivo para cadastro e exposição do seu cão. Você pode criar um perfil com fotos, vídeos, informações de pedigree e conquistas, ideal para criadores e tutores orgulhosos.',
      isOpen: false
    },
    {
      question: 'Como acesso as edições anteriores?',
      answer: 'Todas as edições ficam disponíveis na nossa biblioteca digital "Edições". Assinantes têm acesso ilimitado a todo o acervo histórico da revista.',
      isOpen: false
    },
    {
      question: 'Posso anunciar na revista?',
      answer: 'Sim! Temos espaços dedicados para parceiros e anunciantes, tanto na versão digital quanto no site. Entre em contato através da seção "Anuncie Aqui" para receber nosso Media Kit.',
      isOpen: false
    }
  ];

  toggleItem(index: number) {
    // Fecha outros se quiser accordion style "one at a time"
    this.faqItems.forEach((item, i) => {
      if (i !== index) item.isOpen = false;
    });

    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
