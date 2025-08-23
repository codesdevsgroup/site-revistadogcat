import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Signal para o tema atual
  public readonly currentTheme = signal<Theme>(this.getInitialTheme());
  
  // Signal computado para verificar se está no modo escuro
  public readonly isDarkMode = signal(false);
  
  constructor() {
    // Effect para aplicar o tema quando ele mudar
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.isDarkMode.set(theme === 'dark');
    });
  }
  
  /**
   * Alterna entre tema claro e escuro
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  /**
   * Define um tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
  
  /**
   * Obtém o tema inicial baseado na preferência salva ou do sistema
   */
  private getInitialTheme(): Theme {
    // Verifica se há tema salvo no localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Verifica a preferência do sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return 'light';
  }
  
  /**
   * Aplica o tema ao documento
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Remove tema anterior
      root.removeAttribute('data-theme');
      
      // Aplica novo tema
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      }
    }
  }
}