import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface UserPreferences {
  hasRecurringExpenses: boolean;
  hasFixedIncome: boolean;
  hasSavingsGoals: boolean;
  hasFreelanceIncome: boolean;
  hasClientInvoices: boolean;
  hasProviders: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  accountType: 'PERSONAL' | 'PROFESIONAL' | 'MIXTO';
  preferences: UserPreferences;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  user: UserProfile | null = null;
  isLoading = true;
  greetingMessage = '';

  // 🧼 Cambiamos HttpClient por tu AuthService centralizado
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadUserProfile();
    this.setGreeting();
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (data: UserProfile) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar el perfil:', err);
        this.isLoading = false;
        // Si el perfil falla porque la sesión expiró de verdad, lo ideal es echarlo al login
        this.router.navigate(['/auth/login']);
      }
    });
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingMessage = '¡Buenos días';
    } else if (hour < 18) {
      this.greetingMessage = '¡Buenas tardes';
    } else {
      this.greetingMessage = '¡Buenas noches';
    }
  }
}