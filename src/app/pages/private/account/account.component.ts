import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/auth.service';
import { User, AccountType, UserRole, Subscription, PaymentMethod, SubscriptionStatus } from '../../../core/models';
import { LucideAngularModule, UserIcon, MailIcon, ShieldIcon, CreditCardIcon, SettingsIcon, LogOutIcon, LoaderIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-angular';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  // Icons
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly LogOutIcon = LogOutIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly CheckCircleIcon = CheckCircleIcon;

  // Services
  private authService = inject(AuthService);
  public subscriptionService = inject(SubscriptionService);
  public paymentService = inject(PaymentService);
  private router = inject(Router);

  // State
  user = computed(() => this.authService.currentUserSignal());
  subscription = signal<Subscription | null>(null);
  paymentMethods = signal<PaymentMethod[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form state
  editMode = signal(false);
  formData = signal({
    name: '',
    displayCurrency: 'USD' as 'USD' | 'VES',
  });

  // Computed
  userRole = computed(() => this.user()?.role || 'REGULAR');
  isPremium = computed(() => this.subscriptionService.hasActivePremium(this.subscription()));
  subscriptionStatus = computed(() => this.subscription()?.status as SubscriptionStatus | 'UNKNOWN');
  daysUntilExpiration = computed(() => this.subscriptionService.getDaysUntilExpiration(this.subscription()!));
  defaultPaymentMethod = computed(() => this.paymentMethods().find(pm => pm.isDefault));

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    // Cargar suscripción
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => {
        this.subscription.set(sub);
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
      }
    });

    // Cargar métodos de pago
    this.paymentService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods.set(methods);
      },
      error: (err) => {
        console.error('Error loading payment methods:', err);
      }
    });

    // Inicializar formulario
    const currentUser = this.user();
    if (currentUser) {
      this.formData.set({
        name: currentUser.name || '',
        displayCurrency: currentUser.preferences?.displayCurrency || 'USD',
      });
    }

    this.isLoading.set(false);
  }

  toggleEditMode() {
    this.editMode.update(v => !v);
    if (!this.editMode()) {
      // Resetear formulario si se cancela
      const currentUser = this.user();
      if (currentUser) {
        this.formData.set({
          name: currentUser.name || '',
          displayCurrency: currentUser.preferences?.displayCurrency || 'USD',
        });
      }
      this.error.set(null);
      this.success.set(null);
    }
  }

  saveProfile() {
    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    // TODO: Implementar endpoint de actualización de perfil en el backend
    // Por ahora simulamos
    setTimeout(() => {
      this.authService.refreshUserProfile().subscribe({
        next: (updatedUser) => {
          this.success.set('Perfil actualizado correctamente');
          this.editMode.set(false);
          this.isSaving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar perfil');
          this.isSaving.set(false);
        }
      });
    }, 500);
  }

  navigateToSubscription() {
    this.router.navigate(['/dashboard/subscription']);
  }

  navigateToPaymentMethods() {
    this.router.navigate(['/dashboard/payment-methods']);
  }

  logout() {
    this.authService.logout().subscribe();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'FAILED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}