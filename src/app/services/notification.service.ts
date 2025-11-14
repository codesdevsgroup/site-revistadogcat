import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notyf: Notyf;

  constructor() {
    this.notyf = new Notyf({
      duration: 6000,
      dismissible: true,
      ripple: false,
      position: {
        x: 'right',
        y: 'bottom',
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

  success(message: string): void {
    this.notyf.success(message);
  }

  error(message: string): void {
    this.notyf.error(message);
  }

  warning(message: string): void {
    this.notyf.open({
      type: 'warning',
      message: message
    });
  }

  info(message: string): void {
    this.notyf.open({
      type: 'info',
      message: message
    });
  }

  dismissAll(): void {
    this.notyf.dismissAll();
  }
}
