import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  ShieldCheckIcon,
  LoaderIcon,
  ArrowLeftIcon,
  CircleAlertIcon
} from 'lucide-angular';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './verify-otp.component.html'
})
export class VerifyOtpComponent implements OnInit {
  readonly ShieldCheckIcon = ShieldCheckIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly AlertCircleIcon = CircleAlertIcon;

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

  onCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.code = input.value.replace(/\s/g, '');
  }

  onVerify() {
    if (!this.code || !this.email) return;

    this.isLoading = true;
    
    this.authService.verifyOtp(this.email, this.code).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.user && res.user.isConfigured) {
          this.router.navigate(['/dashboard']);
        } else {

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