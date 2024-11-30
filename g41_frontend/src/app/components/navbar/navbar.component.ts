import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private tokenService: TokenService, private router: Router) {}

  handleLogout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/login']);
  }
  routeToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  routeToSummary(): void {
    this.router.navigate(['/summary']);
  }
  routeToReports(): void {
    this.router.navigate(['/reports']);
  }
}