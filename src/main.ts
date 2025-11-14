import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import 'chart.js/auto';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

document.documentElement.removeAttribute('data-theme');

registerLocaleData(localePt, 'pt-BR');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
