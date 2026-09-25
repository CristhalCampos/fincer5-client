import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  key: string; // Para mapear la respuesta en el JSON
  icon?: string;
  type: 'boolean' | 'select';
  options: { label: string; value: any; sublabel?: string; icon?: string }[];
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html'
})
export class OnboardingComponent {
  currentStepIndex = 0;
  isLoading = false;
  private refreshToken: string = '';

  // 📦 Aquí acumulamos las respuestas temporalmente
  responses: Record<string, any> = {
    hasRecurringExpenses: null,
    hasFixedIncome: null,
    hasSavingsGoals: null,
    hasFreelanceIncome: null,
    hasClientInvoices: null,
    hasProviders: null,
    accountType: null
  };

  steps: OnboardingStep[] = [
    {
      id: 1,
      title: '¿Necesitas registrar gastos personales recurrentes como comida, servicios o transporte?',
      subtitle: 'Esto nos ayudará a automatizar tus proyecciones mensuales y ahorrarte tiempo.',
      key: 'hasRecurringExpenses',
      icon: '📝',
      type: 'boolean',
      options: [{ label: 'Sí', value: true }, { label: 'No', value: false }]
    },
    {
      id: 2,
      title: '¿Recibes un salario fijo o ingresos personales constantes?',
      subtitle: '',
      key: 'hasFixedIncome',
      type: 'boolean',
      options: [
        { label: 'Sí, recibo un salario fijo', value: true },
        { label: 'No, mis ingresos son variables', value: false }
      ]
    },
    {
      id: 3,
      title: '¿Quieres establecer metas de ahorro para objetivos personales (viajes, emergencias, compras)?',
      subtitle: 'Crea fondos específicos para tus viajes, emergencias o compras importantes (como una casa o un carro) de forma automática.',
      key: 'hasSavingsGoals',
      icon: '🐷',
      type: 'boolean',
      options: [{ label: 'Sí, quiero ahorrar', value: true }, { label: 'Ahora no', value: false }]
    },
    {
      id: 4,
      title: '¿Recibes pagos por servicios profesionales, trabajos freelance o ventas?',
      subtitle: 'Esta información nos ayuda a personalizar tu experiencia financiera y reportes de impuestos.',
      key: 'hasFreelanceIncome',
      type: 'boolean',
      options: [{ label: 'Sí, recibo este tipo de ingresos', value: true }, { label: 'No, actualmente no', value: false }]
    },
    {
      id: 5,
      title: '¿Necesitas llevar control de dinero que te deben clientes o pagos pendientes?',
      subtitle: '',
      key: 'hasClientInvoices',
      type: 'boolean',
      options: [{ label: 'Sí, necesito llevar este control', value: true }, { label: 'No, por el momento no', value: false }]
    },
    {
      id: 6,
      title: '¿Pagas regularmente a proveedores o colaboradores?',
      subtitle: '',
      key: 'hasProviders',
      icon: '💵',
      type: 'boolean',
      options: [{ label: 'Sí, de forma habitual', value: true }, { label: 'No, por ahora no', value: false }]
    },
    {
      id: 7,
      title: '¿Cómo planeas usar la aplicación?',
      subtitle: 'Selecciona la opción que mejor se adapte a tus necesidades para personalizar tu experiencia financiera.',
      key: 'accountType',
      type: 'select',
      options: [
        { label: 'Personal', value: 'PERSONAL', icon: '👤' },
        { label: 'Profesional', value: 'PROFESIONAL', icon: '💼' },
        { label: 'Mixto', value: 'MIXTO', icon: '📊' }
      ]
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  get currentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex];
  }

  get progressPercentage(): number {
    return Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100);
  }

  selectOption(value: any) {
    const key = this.currentStep.key;
    this.responses[key] = value;
  }

  nextStep() {
    if (this.responses[this.currentStep.key] === null) return; // Validación rápida

    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    } else {
      this.submitOnboarding();
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  submitOnboarding() {
    if (this.responses[this.currentStep.key] === null) return;
    
    this.isLoading = true;
    
    // 2. Consumes el método del servicio de forma limpia
    this.authService.completeOnboarding(this.responses).subscribe({
      next: (res) => {
        console.log('Configuración guardada exitosamente:', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en onboarding:', err);
        alert(err.error?.message || 'Error al guardar la configuración.');
      }
    });
  }
}