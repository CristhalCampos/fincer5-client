import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  MailIcon,
  LoaderIcon
} from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  readonly MailIcon = MailIcon;
  readonly LoaderIcon = LoaderIcon;

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
        // 💡 Tip UX: En el futuro, considerar reemplazar este `alert` por un componente Toast/Snackbar
        alert(err.error?.message || 'Error al enviar el código. Inténtalo de nuevo.');
      }
    });
  }

  loginWithGoogle() {
    this.isLoading = true;
    console.log('Iniciando flujo con Google...');

    // this.authService.loginWithGoogle().subscribe(...)
    
    // Simulación temporal para que el botón no se quede bloqueado en "loading"
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }
}