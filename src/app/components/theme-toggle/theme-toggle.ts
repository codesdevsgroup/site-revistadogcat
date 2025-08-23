import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      type="button"
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [attr.aria-label]="isDarkMode() ? 'Ativar tema claro' : 'Ativar tema escuro'"
      [title]="isDarkMode() ? 'Ativar tema claro' : 'Ativar tema escuro'"
    >
      <div class="toggle-container">
        <div class="toggle-track" [class.dark]="isDarkMode()">
          <div class="toggle-thumb" [class.dark]="isDarkMode()">
            <svg 
              class="theme-icon"
              [class.sun]="!isDarkMode()"
              [class.moon]="isDarkMode()"
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              @if (!isDarkMode()) {
                <!-- Ícone do Sol -->
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              } @else {
                <!-- Ícone da Lua -->
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              }
            </svg>
          </div>
        </div>
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: transparent;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      color: var(--gray-700);
      font-size: 0.875rem;
      font-weight: var(--fontWeight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover {
        background: var(--gray-100);
        border-color: var(--gray-400);
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &:focus-visible {
        outline: 2px solid var(--primaryColor);
        outline-offset: 2px;
      }
    }
    
    .theme-icon {
      transition: transform var(--transition-normal);
      
      &.sun {
        color: var(--goldenColor);
      }
      
      &.moon {
        color: var(--gray-600);
      }
    }
    
    .theme-text {
      font-size: 0.8rem;
      
      @media (max-width: 640px) {
        display: none;
      }
    }
    
    // Dark theme styles
    :host-context([data-theme="dark"]) {
      .theme-toggle-btn {
        color: var(--gray-300);
        border-color: var(--gray-600);
        
        &:hover {
          background: var(--gray-800);
          border-color: var(--gray-500);
        }
      }
      
      .theme-icon.moon {
        color: var(--secondaryColor);
      }
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  
  // Expor signals do serviço
  isDarkMode = this.themeService.isDarkMode;
  currentTheme = this.themeService.currentTheme;
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}