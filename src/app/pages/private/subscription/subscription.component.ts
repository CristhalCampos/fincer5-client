import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/auth.service';
import { 
  Subscription, 
  Plan, 
  SubscriptionStatus, 
  PaymentProvider,
  PaymentMethod 
} from '../../../core/models';
import { LucideAngularModule, ShieldIcon, CreditCardIcon, ArrowRightIcon, CheckIcon, XIcon, AlertCircleIcon, CheckCircleIcon, LoaderIcon, CrownIcon, CalendarIcon, DollarSignIcon, LockIcon, UnlockIcon, ZapIcon, ExternalLinkIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-angular';

interface PlanFeature {
  name: string;
  included: boolean;
  premiumOnly?: boolean;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  // Icons
  readonly ShieldIcon = ShieldIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly ArrowRightIcon = ArrowRightIcon;
  readonly CheckIcon = CheckIcon;
  readonly XIcon = XIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly CrownIcon = CrownIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly LockIcon = LockIcon;
  readonly UnlockIcon = UnlockIcon;
  readonly ZapIcon = ZapIcon;
  readonly ExternalLinkIcon = ExternalLinkIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;

  // Services
  private authService = inject(AuthService);
  public subscriptionService = inject(SubscriptionService);
  public paymentService = inject(PaymentService);
  private router = inject(Router);

  // State
  user = computed(() => this.authService.currentUserSignal());
  currentSubscription = signal<Subscription | null>(null);
  availablePlans = signal<Plan[]>([]);
  paymentMethods = signal<any[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  selectedPlan = signal<Plan | null>(null);
  selectedPaymentMethodId = signal<string | null>(null);
  showPaymentModal = signal(false);
  paymentReference = signal('');

  // Computed
  isPremium = computed(() => this.subscriptionService.hasActivePremium(this.currentSubscription()));
  currentPlan = computed(() => this.currentSubscription()?.plan);
  daysUntilExpiration = computed(() => this.currentSubscription() ? this.subscriptionService.getDaysUntilExpiration(this.currentSubscription()!) : null);
  canUpgrade = computed(() => !this.isPremium() || this.currentSubscription()?.status === 'CANCELED' || this.currentSubscription()?.status === 'EXPIRED');
  defaultPaymentMethod = computed(() => this.paymentMethods().find(pm => pm.isDefault));

  // Feature comparison
  planFeatures: PlanFeature[] = [
    { name: 'Registro manual de transacciones', included: true },
    { name: 'Tasa de cambio BCV oficial', included: true },
    { name: 'Categorías fijas del sistema', included: true },
    { name: 'Dashboard básico', included: true },
    { name: 'OCR de comprobantes (Pago Móvil)', included: false, premiumOnly: true },
    { name: 'Costo de reposición de inventario', included: false, premiumOnly: true },
    { name: 'Alertas proactivas de devaluación', included: false, premiumOnly: true },
    { name: 'Facturación y cuentas por cobrar', included: false, premiumOnly: true },
    { name: 'Gestión de proveedores y cuentas por pagar', included: false, premiumOnly: true },
    { name: 'Tasa de cambio personalizada', included: false, premiumOnly: true },
    { name: 'Categorías personalizadas ilimitadas', included: false, premiumOnly: true },
    { name: 'Reportes avanzados y exportación', included: false, premiumOnly: true },
    { name: 'Soporte prioritario', included: false, premiumOnly: true },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    // Cargar suscripción actual
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => {
        this.currentSubscription.set(sub);
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
        this.error.set('Error al cargar la suscripción');
      }
    });

    // Cargar planes disponibles
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.availablePlans.set(plans.filter(p => p.isActive && p.name !== 'FREE'));
      },
      error: (err) => {
        console.error('Error loading plans:', err);
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

    this.isLoading.set(false);
  }

  selectPlan(plan: Plan) {
    this.selectedPlan.set(plan);
    this.selectedPaymentMethodId.set(this.defaultPaymentMethod()?.id || null);
    this.showPaymentModal.set(true);
    this.error.set(null);
    this.success.set(null);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedPlan.set(null);
    this.paymentReference.set('');
  }

  async processPayment() {
    if (!this.selectedPlan() || !this.selectedPaymentMethodId()) {
      this.error.set('Selecciona un plan y un método de pago');
      return;
    }

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const plan = this.selectedPlan()!;
      const result = await this.paymentService.processManualPayment({
        planId: plan.id,
        paymentMethodId: this.selectedPaymentMethodId()!,
        amount: plan.price,
        reference: this.paymentReference() || `MANUAL-${Date.now()}`,
      }).toPromise();

      if (result?.success) {
        this.success.set(`¡Suscripción a ${plan.displayName} activada exitosamente!`);
        this.closePaymentModal();
        this.loadData(); // Recargar datos
      } else {
        this.error.set('Error al procesar el pago');
      }
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al procesar el pago. Verifica el monto y método de pago.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  cancelSubscription() {
    if (!confirm('¿Estás seguro? Mantendrás acceso hasta el fin del período actual, pero no se renovará automáticamente.')) {
      return;
    }

    this.isProcessing.set(true);
    this.subscriptionService.cancelSubscription().subscribe({
      next: (sub) => {
        this.currentSubscription.set(sub);
        this.success.set('Suscripción cancelada. Tendrás acceso hasta el fin del período actual.');
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cancelar la suscripción');
        this.isProcessing.set(false);
      }
    });
  }

  navigateToPaymentMethods() {
    this.router.navigate(['/dashboard/payment-methods']);
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

  getStatusIcon(status: string) {
    switch (status) {
      case 'ACTIVE': return this.CheckCircleIcon;
      case 'CANCELED': return this.CalendarIcon;
      case 'EXPIRED': return this.XIcon;
      case 'FAILED': return this.AlertCircleIcon;
      default: return this.ShieldIcon;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getBillingCycleLabel(cycle: string): string {
    switch (cycle) {
      case 'MONTHLY': return '/mes';
      case 'YEARLY': return '/año';
      case 'LIFETIME': return ' (pago único)';
      default: return '';
    }
  }
}