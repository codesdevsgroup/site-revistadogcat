import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notyf: Notyf;

  constructor() {
    this.notyf = new Notyf({
      duration: 5000, // 5 segundos
      position: {
        x: 'right',
        y: 'top',
      },
      types: [
        {
          type: 'success',
          backgroundColor: '#28a745',
          icon: {
            className: 'fas fa-check-circle',
            tagName: 'i',
            color: 'white'
          }
        },
        {
          type: 'error',
          backgroundColor: '#dc3545',
          icon: {
            className: 'fas fa-times-circle',
            tagName: 'i',
            color: 'white'
          }
        },
        {
          type: 'warning',
          backgroundColor: '#ffc107',
          icon: {
            className: 'fas fa-exclamation-triangle',
            tagName: 'i',
            color: 'white'
          }
        },
        {
          type: 'info',
          backgroundColor: '#17a2b8',
          icon: {
            className: 'fas fa-info-circle',
            tagName: 'i',
            color: 'white'
          }
        }
      ]
    });
  }

  /**
   * Exibe uma notificação de sucesso.
   * @param message A mensagem a ser exibida.
   */
  success(message: string): void {
    this.notyf.success(message);
  }

  /**
   * Exibe uma notificação de erro.
   * @param message A mensagem a ser exibida.
   */
  error(message: string): void {
    this.notyf.error(message);
  }

  /**
   * Exibe uma notificação de aviso.
   * @param message A mensagem a ser exibida.
   */
  warning(message: string): void {
    this.notyf.open({
      type: 'warning',
      message: message
    });
  }

  /**
   * Exibe uma notificação informativa.
   * @param message A mensagem a ser exibida.
   */
  info(message: string): void {
    this.notyf.open({
      type: 'info',
      message: message
    });
  }

  /**
   * Limpa todas as notificações.
   */
  dismissAll(): void {
    this.notyf.dismissAll();
  }
}
