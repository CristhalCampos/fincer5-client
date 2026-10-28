import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ExchangeRateService, RateData, CurrentRateResponse } from '../../../core/services/exchange-rate.service';
import { User } from '../../../core/models';
import {
  LucideAngularModule,
  WalletIcon,
  PlusIcon,
  PlusCircleIcon,
  TargetIcon,
  ScanLineIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CrownIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private exchangeRateService = inject(ExchangeRateService);

  user: User | null = null;

  readonly WalletIcon = WalletIcon;
  readonly PlusIcon = PlusIcon;
  readonly PlusCircleIcon = PlusCircleIcon;
  readonly TargetIcon = TargetIcon;
  readonly ScanLineIcon = ScanLineIcon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly TrendingUpIcon = TrendingUpIcon;
  readonly TrendingDownIcon = TrendingDownIcon;
  readonly ClockIcon = ClockIcon;
  readonly CrownIcon = CrownIcon;

  // Datos de tasas de cambio (inicializados en constructor)
  myRate = this.exchangeRateService.myRate$;
  isUsingCustomRate = this.exchangeRateService.isUsingCustomRate;
  applicableRate = this.exchangeRateService.applicableRate;
  myRateLoading = this.exchangeRateService.myRateLoading$;
  currentRate = this.exchangeRateService.currentRate$;

  history: RateData[] = [];
  historyLoading = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    // Cargar tasa aplicable al usuario (considera custom si es PREMIUM)
    this.exchangeRateService.getMyRate().subscribe();

    // Cargar tasa BCV pública para obtener el cambio porcentual
    this.exchangeRateService.getCurrentRate().subscribe();

    // Cargar historial de tasas
    this.historyLoading = true;
    this.exchangeRateService.getRecentHistory(4).subscribe({
      next: (rates) => {
        this.history = rates;
        this.historyLoading = false;
      },
      error: () => {
        this.historyLoading = false;
      }
    });
  }

  // Helper para formatear moneda
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Helper para obtener el cambio porcentual
  getChangePercentage(): number | null {
    const current = this.currentRate();
    if (current?.changePercentage?.usd !== undefined) return current.changePercentage.usd;
    return null;
  }

  getTrendIcon() {
    const change = this.getChangePercentage();
    if (change === null) return this.ClockIcon;
    if (change > 0) return this.TrendingUpIcon;
    if (change < 0) return this.TrendingDownIcon;
    return this.ClockIcon;
  }

  getTrendColorClass() {
    const change = this.getChangePercentage();
    if (change === null) return 'text-gray-500';
    if (change > 0) return 'text-red-500';
    if (change < 0) return 'text-green-500';
    return 'text-gray-500';
  }

  // Helper para obtener el cambio porcentual formateado
  changePercentageFormatted = computed(() => {
    const change = this.getChangePercentage();
    if (change === null) return '--';
    return (change > 0 ? '+' : '') + change.toFixed(2) + '%';
  });

  // Helper para validar y parsear fechas seguras
  private parseSafeDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = this.parseSafeDate(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-VE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  }
}