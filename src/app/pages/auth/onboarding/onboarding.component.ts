import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  UserIcon,
  BriefcaseIcon,
  LayersIcon,
  WalletIcon,
  PiggyBankIcon,
  FileTextIcon,
  DollarSignIcon,
  CheckIcon,
  LoaderIcon
} from 'lucide-angular';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  key: string;
  icon: any;
  type: 'single' | 'boolean';
  options: { label: string; value: any; sublabel?: string; icon?: any }[];
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './onboarding.component.html'
})
export class OnboardingComponent {
  readonly UserIcon = UserIcon;
  readonly BriefcaseIcon = BriefcaseIcon;
  readonly LayersIcon = LayersIcon;
  readonly WalletIcon = WalletIcon;
  readonly PiggyBankIcon = PiggyBankIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly CheckIcon = CheckIcon;
  readonly LoaderIcon = LoaderIcon;

  currentStepIndex = 0;
  isLoading = false;

  responses: Record<string, any> = {
    accountType: undefined,
    hasFixedIncome: undefined,
    hasFreelanceIncome: undefined,
    hasSavingsGoals: undefined,
    hasClientInvoices: undefined,
    displayCurrency: undefined
  };

  steps: OnboardingStep[] = [
    {
      id: 1,
      title: '¿Cómo planeas usar Fincer5?',
      subtitle: 'Esto definirá las categorías y herramientas que veremos primero.',
      key: 'accountType',
      icon: UserIcon,
      type: 'single',
      options: [
        { label: 'Solo Personal', value: 'PERSONAL', sublabel: 'Gastos, nómina y ahorro personal', icon: UserIcon },
        { label: 'Solo Profesional', value: 'PROFESSIONAL', sublabel: 'Freelance, ventas o negocio independiente', icon: BriefcaseIcon },
        { label: 'Combinado (Switch)', value: 'COMBINED', sublabel: 'Quiero separar mis finanzas personales y de negocio', icon: LayersIcon }
      ]
    },
    {
      id: 2,
      title: '¿Cuál es tu tipo principal de ingresos?',
      subtitle: 'Nos ayuda a proyectar mejor tu flujo de caja mensual.',
      key: 'incomeType', // Clave temporal, luego la dividimos
      icon: WalletIcon,
      type: 'single',
      options: [
        { label: 'Salario fijo o nómina', value: 'FIXED', icon: BriefcaseIcon },
        { label: 'Ingresos variables (Freelance/Ventas)', value: 'VARIABLE', icon: WalletIcon },
        { label: 'Ambos (Fijo y Variable)', value: 'BOTH', icon: LayersIcon }
      ]
    },
    {
      id: 3,
      title: '¿Te gustaría establecer metas de ahorro?',
      subtitle: 'Crea fondos específicos para emergencias, viajes o compras importantes.',
      key: 'hasSavingsGoals',
      icon: PiggyBankIcon,
      type: 'single',
      options: [
        { label: 'Sí, quiero crear metas de ahorro', value: true },
        { label: 'No por el momento', value: false }
      ]
    },
    {
      id: 4,
      title: '¿Necesitas emitir facturas o controlar cuentas por cobrar?',
      subtitle: 'Ideal si tienes clientes que te pagan a 30, 60 o 90 días.',
      key: 'hasClientInvoices',
      icon: FileTextIcon,
      type: 'single',
      options: [
        { label: 'Sí, necesito facturar y cobrar', value: true },
        { label: 'No, mis ingresos son inmediatos', value: false }
      ]
    },
    {
      id: 5,
      title: '¿En qué moneda prefieres ver tus reportes?',
      subtitle: 'Puedes cambiar esto en cualquier momento desde la configuración.',
      key: 'displayCurrency',
      icon: DollarSignIcon,
      type: 'single',
      options: [
        { label: 'Dólares (USD)', value: 'USD', sublabel: 'Recomendado para proteger tu patrimonio de la devaluación', icon: DollarSignIcon },
        { label: 'Bolívares (VES)', value: 'VES', sublabel: 'Indexado automáticamente a la tasa del día', icon: WalletIcon }
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

    // Lógica especial para el paso 2: mapear a las dos variables de Prisma
    if (key === 'incomeType') {
      this.responses['hasFixedIncome'] = (value === 'FIXED' || value === 'BOTH');
      this.responses['hasFreelanceIncome'] = (value === 'VARIABLE' || value === 'BOTH');
    }
  }

  isStepValid(): boolean {
    return this.responses[this.currentStep.key] !== undefined;
  }

  nextStep() {
    if (!this.isStepValid()) return;

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
    if (!this.isStepValid()) return;
    
    this.isLoading = true;
    
    // Eliminamos la clave temporal 'incomeType' antes de enviar al backend
    const { incomeType, ...finalResponses } = this.responses;

    this.authService.completeOnboarding(finalResponses).subscribe({
      next: (res) => {
        console.log('Configuración guardada exitosamente:', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en onboarding:', err);
        alert(err.error?.message || 'Error al guardar la configuración. Inténtalo de nuevo.');
      }
    });
  }
}