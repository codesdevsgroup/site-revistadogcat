import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FingerprintService {
  private fingerprintKey = 'device_fingerprint';
  private fingerprint: string | null = null;

  constructor() {
    this.initializeFingerprint();
  }

  /**
   * Obtém ou cria um fingerprint único para o dispositivo
   */
  getFingerprint(): string {
    if (!this.fingerprint) {
      this.fingerprint = this.loadOrCreateFingerprint();
    }
    return this.fingerprint;
  }

  /**
   * Carrega fingerprint existente ou cria um novo
   */
  private loadOrCreateFingerprint(): string {
    // Tenta carregar do localStorage
    const stored = this.loadFromStorage();
    if (stored) {
      return stored;
    }

    // Cria novo fingerprint baseado em características do navegador
    const newFingerprint = this.generateFingerprint();
    this.saveToStorage(newFingerprint);
    return newFingerprint;
  }

  /**
   * Inicializa o fingerprint ao carregar o serviço
   */
  private initializeFingerprint(): void {
    this.fingerprint = this.loadOrCreateFingerprint();
  }

  /**
   * Gera um fingerprint único baseado em características do navegador e dispositivo
   */
  private generateFingerprint(): string {
    const components: string[] = [];

    // User Agent
    components.push(navigator.userAgent);

    // Linguagem
    components.push(navigator.language);

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Resolução da tela
    components.push(`${screen.width}x${screen.height}`);

    // Profundidade de cor
    components.push(`${screen.colorDepth}`);

    // Plataforma
    components.push(navigator.platform);

    // Hardware Concurrency (número de CPUs)
    if (navigator.hardwareConcurrency) {
      components.push(`${navigator.hardwareConcurrency}`);
    }

    // Device Memory (se disponível)
    if ('deviceMemory' in navigator) {
      components.push(`${(navigator as any).deviceMemory}`);
    }

    // Plugins (se disponível)
    if (navigator.plugins && navigator.plugins.length > 0) {
      const pluginList = Array.from(navigator.plugins)
        .map((p) => p.name)
        .sort()
        .join(',');
      components.push(pluginList);
    }

    // Canvas fingerprint (simples)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 100, 50);
        ctx.fillStyle = '#069';
        ctx.fillText('Fingerprint', 2, 15);
        const canvasData = canvas.toDataURL();
        components.push(canvasData);
      }
    } catch (e) {
      // Canvas pode não estar disponível
    }

    // WebGL fingerprint
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && typeof gl === 'object') {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          components.push(`${vendor}~${renderer}`);
        }
      }
    } catch (e) {
      // WebGL pode não estar disponível
    }

    // Session Storage disponível
    components.push(this.isStorageAvailable('sessionStorage').toString());

    // Local Storage disponível
    components.push(this.isStorageAvailable('localStorage').toString());

    // IndexedDB disponível
    components.push((!!window.indexedDB).toString());

    // Timestamp + Random para garantir unicidade
    components.push(Date.now().toString());
    components.push(Math.random().toString(36).substring(2, 15));

    // Gera hash dos componentes
    const fingerprint = this.hashComponents(components.join('|'));

    return fingerprint;
  }

  /**
   * Gera um hash simples dos componentes
   */
  private hashComponents(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Converte para base 36 e adiciona timestamp para garantir unicidade
    const hashStr = Math.abs(hash).toString(36);
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);

    return `fp_${hashStr}_${timestamp}_${random}`;
  }

  /**
   * Verifica se um tipo de storage está disponível
   */
  private isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Carrega fingerprint do localStorage
   */
  private loadFromStorage(): string | null {
    try {
      if (this.isStorageAvailable('localStorage')) {
        return localStorage.getItem(this.fingerprintKey);
      }
    } catch (e) {
      console.warn('Erro ao carregar fingerprint:', e);
    }
    return null;
  }

  /**
   * Salva fingerprint no localStorage
   */
  private saveToStorage(fingerprint: string): void {
    try {
      if (this.isStorageAvailable('localStorage')) {
        localStorage.setItem(this.fingerprintKey, fingerprint);
      }
    } catch (e) {
      console.warn('Erro ao salvar fingerprint:', e);
    }
  }

  /**
   * Limpa o fingerprint armazenado (útil para testes)
   */
  clearFingerprint(): void {
    this.fingerprint = null;
    try {
      if (this.isStorageAvailable('localStorage')) {
        localStorage.removeItem(this.fingerprintKey);
      }
    } catch (e) {
      console.warn('Erro ao limpar fingerprint:', e);
    }
  }

  /**
   * Regenera o fingerprint (útil para testes)
   */
  regenerateFingerprint(): string {
    this.clearFingerprint();
    this.fingerprint = this.generateFingerprint();
    this.saveToStorage(this.fingerprint);
    return this.fingerprint;
  }
}
