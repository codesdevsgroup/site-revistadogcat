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
      background: transparent;
      border: none;
      padding: var(--space-2);
      cursor: pointer;
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
      
      &:hover {
        transform: scale(1.05);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      &:focus-visible {
        outline: 2px solid var(--primaryColor);
        outline-offset: 2px;
      }
    }
    
    .toggle-container {
      position: relative;
    }
    
    .toggle-track {
      width: 52px;
      height: 28px;
      background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
      border-radius: var(--radius-full);
      position: relative;
      transition: all var(--transition-normal);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      
      &.dark {
        background: linear-gradient(135deg, var(--primaryColor) 0%, var(--primaryColorDark) 100%);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(159, 214, 73, 0.3);
        border-color: var(--primaryColorDark);
      }
    }
    
    .toggle-thumb {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: all var(--transition-normal);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.05);
      
      &.dark {
        transform: translateX(24px);
        background: linear-gradient(135deg, var(--secondaryColor) 0%, var(--secondaryColorLight) 100%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
        border-color: var(--secondaryColorDark);
      }
    }
    
    .theme-icon {
      transition: all var(--transition-normal);
      
      &.sun {
        color: var(--goldenColor);
        animation: rotate 2s linear infinite;
      }
      
      &.moon {
        color: var(--primaryColorDark);
      }
    }
    
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    // Dark theme styles
    :host-context([data-theme="dark"]) {
      .toggle-track:not(.dark) {
        background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
        border-color: #6b7280;
      }
      
      .toggle-thumb:not(.dark) {
        background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
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