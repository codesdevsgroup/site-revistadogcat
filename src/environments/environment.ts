export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  appName: 'Revista Dog & Cat - Dev',
  version: '1.0.0-dev',
  enableLogging: true,
  enableDebugMode: true,
  maxFileUploadSize: 10485760, // 10MB
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  cacheTimeout: 300000, // 5 minutes
  features: {
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceMonitoring: false
  }
};
