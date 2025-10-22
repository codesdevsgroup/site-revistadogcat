import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopMenuComponent } from './components/top-menu/top-menu';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../enums/role.enum';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopMenuComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleRoleBasedRedirect();
  }

  private handleRoleBasedRedirect(): void {
    const user = this.authService.getCurrentUser();
    
    if (user && user.role === Role.EDITOR) {
      // Editores são redirecionados automaticamente para artigos
      const currentUrl = this.router.url;
      if (currentUrl === '/admin' || currentUrl === '/admin/dashboard') {
        this.router.navigate(['/admin/artigos']);
      }
    }
  }
}
