import { bootstrapApplication } from '@angular/platform-browser';
import 'chart.js/auto';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

document.documentElement.removeAttribute('data-theme');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
