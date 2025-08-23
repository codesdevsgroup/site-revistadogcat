import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import {NavbarComponent} from './components/navbar/navbar';
import {WhatsappFloatComponent} from './components/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, WhatsappFloatComponent, CommonModule],
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {
  title = 'site-revistadogcat';
  isPainelRoute = false;
  private router = inject(Router);

  ngOnInit() {
    // Verificar rota inicial
    this.isPainelRoute = this.router.url.startsWith('/painel');
    
    // Escutar mudanças de rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isPainelRoute = event.url.startsWith('/painel');
      });
  }
}


