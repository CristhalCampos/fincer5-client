import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email) return;

    this.isLoading = true;
    this.authService.loginLocal(this.email).subscribe({
      next: () => {
        this.router.navigate(['/auth/verify-otp'], { state: { email: this.email } });
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Error al enviar el código. Inténtalo de nuevo.');
      }
    });
  }

  loginWithGoogle() {
    console.log('Iniciando flujo con Google...');
  }
}