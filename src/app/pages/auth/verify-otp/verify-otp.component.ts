import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.component.html'
})
export class VerifyOtpComponent implements OnInit {
  email: string = '';
  code: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras.state?.['email'] || '';
  }

  ngOnInit() {
    if (!this.email) {
      this.router.navigate(['/auth/login']);
    }
  }

  onVerify() {
    if (!this.code || !this.email) return;

    this.isLoading = true;
    
    this.authService.verifyOtp(this.email, this.code).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // 🧠 Evaluamos tu campo de Prisma de la respuesta
        if (res.user && res.user.isConfigured) {
          this.router.navigate(['/dashboard']);
        } else {
          // Va directo, la cookie ya está sembrada de forma invisible en el navegador 🤫
          this.router.navigate(['/auth/onboarding']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Código incorrecto o expirado.');
      }
    });
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }
}