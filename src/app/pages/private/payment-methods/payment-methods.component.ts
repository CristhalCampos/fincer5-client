import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/auth.service';
import { PaymentMethod, PaymentProvider } from '../../../core/models';
import { LucideAngularModule, CreditCardIcon, PlusIcon, Trash2Icon, CheckIcon, ShieldIcon, SmartphoneIcon, BitcoinIcon, LoaderIcon, AlertCircleIcon, CheckCircleIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon } from 'lucide-angular';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css']
})
export class PaymentMethodsComponent implements OnInit {
  // Expose enum for template
  readonly PaymentProvider = PaymentProvider;

  // Icons
  readonly CreditCardIcon = CreditCardIcon;
  readonly PlusIcon = PlusIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly CheckIcon = CheckIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly SmartphoneIcon = SmartphoneIcon;
  readonly BitcoinIcon = BitcoinIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly ExternalLinkIcon = ExternalLinkIcon;
  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;

  // Service
  private paymentService = inject(PaymentService);

  // State
  paymentMethods = signal<PaymentMethod[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showAddModal = signal(false);
  editingMethod = signal<PaymentMethod | null>(null);

  // Form
  newMethod = signal({
    provider: PaymentProvider.MANUAL,
    externalEmail: '',
    bankName: '',
    idNumber: '',
    phoneNumber: '',
    isDefault: false,
  });
  showSensitiveData = signal(false);

  ngOnInit() {
    this.loadMethods();
  }

  loadMethods() {
    this.isLoading.set(true);
    this.paymentService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods.set(methods);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading payment methods:', err);
        this.error.set('Error al cargar métodos de pago');
        this.isLoading.set(false);
      }
    });
  }

  openAddModal() {
    this.newMethod.set({
      provider: PaymentProvider.MANUAL,
      externalEmail: '',
      bankName: '',
      idNumber: '',
      phoneNumber: '',
      isDefault: this.paymentMethods().length === 0,
    });
    this.editingMethod.set(null);
    this.showAddModal.set(true);
    this.error.set(null);
  }

  editMethod(method: PaymentMethod) {
    this.editingMethod.set(method);
    this.newMethod.set({
      provider: method.provider,
      externalEmail: method.externalEmail || '',
      bankName: method.bankName || '',
      idNumber: method.idNumber || '',
      phoneNumber: method.phoneNumber || '',
      isDefault: method.isDefault,
    });
    this.showAddModal.set(true);
    this.error.set(null);
  }

  closeModal() {
    this.showAddModal.set(false);
    this.editingMethod.set(null);
    this.error.set(null);
  }

  onProviderChange() {
    // Reset campos específicos del proveedor
    const provider = this.newMethod().provider;
    this.newMethod.update(current => ({
      ...current,
      externalEmail: provider === PaymentProvider.BINANCE || provider === PaymentProvider.PAYPAL ? current.externalEmail : '',
      bankName: provider === PaymentProvider.MANUAL ? current.bankName : '',
      idNumber: provider === PaymentProvider.MANUAL ? current.idNumber : '',
      phoneNumber: provider === PaymentProvider.MANUAL ? current.phoneNumber : '',
    }));
  }

  saveMethod() {
    const form = this.newMethod();
    this.error.set(null);

    // Validación
    if (form.provider === PaymentProvider.BINANCE || form.provider === PaymentProvider.PAYPAL) {
      if (!form.externalEmail || !form.externalEmail.includes('@')) {
        this.error.set('Email válido requerido para ' + form.provider);
        return;
      }
    }
    if (form.provider === PaymentProvider.MANUAL) {
      if (!form.bankName || !form.idNumber || !form.phoneNumber) {
        this.error.set('Banco, cédula y teléfono son requeridos para Pago Móvil');
        return;
      }
    }

    this.isSaving.set(true);

    if (this.editingMethod()) {
      // Eliminar y crear nuevo (simplificado - en producción usar PATCH)
      this.paymentService.deletePaymentMethod(this.editingMethod()!.id).subscribe({
        next: () => this.createNewMethod(),
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar');
          this.isSaving.set(false);
        }
      });
    } else {
      this.createNewMethod();
    }
  }

  private createNewMethod() {
    const form = this.newMethod();
    this.paymentService.createPaymentMethod(form).subscribe({
      next: (method) => {
        // Si es default, actualizar los demás
        if (form.isDefault) {
          this.paymentService.setDefaultPaymentMethod(method.id).subscribe({
            next: () => {
              this.success.set('Método de pago agregado correctamente');
              this.closeModal();
              this.loadMethods();
              this.isSaving.set(false);
            },
            error: () => {
              this.success.set('Método de pago agregado (error al establecer default)');
              this.closeModal();
              this.loadMethods();
              this.isSaving.set(false);
            }
          });
        } else {
          this.success.set('Método de pago agregado correctamente');
          this.closeModal();
          this.loadMethods();
          this.isSaving.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al agregar método de pago');
        this.isSaving.set(false);
      }
    });
  }

  setDefault(id: string) {
    this.paymentService.setDefaultPaymentMethod(id).subscribe({
      next: () => {
        this.success.set('Método predeterminado actualizado');
        this.loadMethods();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al actualizar');
      }
    });
  }

  deleteMethod(id: string) {
    if (!confirm('¿Eliminar este método de pago? No podrás recuperarlo.')) return;
    if (this.paymentMethods().length === 1) {
      this.error.set('Debe tener al menos un método de pago');
      return;
    }

    this.paymentService.deletePaymentMethod(id).subscribe({
      next: () => {
        this.success.set('Método de pago eliminado');
        this.loadMethods();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar');
      }
    });
  }

  toggleSensitiveData() {
    this.showSensitiveData.update(v => !v);
  }

  getProviderIcon(provider: PaymentProvider) {
    switch (provider) {
      case PaymentProvider.BINANCE: return this.BitcoinIcon;
      case PaymentProvider.PAYPAL: return this.CreditCardIcon;
      case PaymentProvider.MANUAL: return this.SmartphoneIcon;
      default: return this.CreditCardIcon;
    }
  }

  getProviderDisplayName(provider: PaymentProvider): string {
    return this.paymentService.getProviderDisplayName(provider);
  }

  getRequiredFields(provider: PaymentProvider): string[] {
    switch (provider) {
      case PaymentProvider.BINANCE:
      case PaymentProvider.PAYPAL:
        return ['externalEmail'];
      case PaymentProvider.MANUAL:
        return ['bankName', 'idNumber', 'phoneNumber'];
      default:
        return [];
    }
  }
}