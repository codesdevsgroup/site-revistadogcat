import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../public/components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../enums/role.enum';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

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
