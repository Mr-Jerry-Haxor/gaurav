import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private toastService: ToastService
  ) {}

  handleSubmit(): void {
    if (!this.username || !this.password) {
      this.error = 'Username and password cannot be empty.';
      this.toastService.error('Username and password cannot be empty.');
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        this.tokenService.saveToken(response.access_token);
        this.router.navigate(['/dashboard']);
        this.toastService.success('Login successful!');
      },
      (error) => {
        this.error = 'Login failed. Please check your username and password.';
        this.toastService.error('Login failed. Please check your username and password.');
        console.error('Login failed', error);
      }
    );
  }
}