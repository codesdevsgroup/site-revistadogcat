import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopMenuComponent } from './components/top-menu/top-menu';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopMenuComponent],
  templateUrl: './painel.html',
  styleUrls: ['./painel.scss']
})
export class PainelComponent {
  constructor() {}
}
