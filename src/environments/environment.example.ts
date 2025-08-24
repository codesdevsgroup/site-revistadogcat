// Exemplo de como usar os environments nos seus componentes e serviços

// 1. Importar o environment
import { environment } from './environment';

// 2. Exemplos de uso em um serviço
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor() {
    if (environment.enableLogging) {
      console.log('API URL:', this.apiUrl);
    }
  }
  
  // Método para fazer requisições
  getData() {
    return fetch(`${this.apiUrl}/data`);
  }
}

// 3. Exemplo de uso em um componente
export class AppComponent {
  title = environment.appName;
  version = environment.version;
  isProduction = environment.production;
  
  constructor() {
    if (environment.enableDebugMode) {
      console.log('App iniciado em modo debug');
    }
  }
  
  // Método para upload de arquivo
  onFileUpload(file: File) {
    if (file.size > environment.maxFileUploadSize) {
      alert('Arquivo muito grande!');
      return;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!environment.supportedImageFormats.includes(extension || '')) {
      alert('Formato não suportado!');
      return;
    }
    
    // Proceder com upload...
  }
}

// 4. Exemplo de configuração condicional
if (environment.features.enableAnalytics) {
  // Inicializar Google Analytics ou similar
}

if (environment.features.enableErrorReporting) {
  // Configurar Sentry ou similar
}