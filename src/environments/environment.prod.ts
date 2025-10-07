export const environment = {
  production: true,
  apiUrl: 'https://api.revistadogcat.com.br',
  appName: 'Revista Dog & Cat',
  version: '1.0.0',
  enableLogging: false,
  enableDebugMode: false,
  maxFileUploadSize: 5242880, // 5MB
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  cacheTimeout: 1800000, // 30 minutes
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true
  }
};
