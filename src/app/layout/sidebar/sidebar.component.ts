import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LayoutDashboardIcon, WalletIcon, PiggyBankIcon, TrendingUpIcon, XIcon, UserIcon, ShieldIcon, CreditCardIcon, SettingsIcon } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly LayoutDashboardIcon = LayoutDashboardIcon;
  readonly WalletIcon = WalletIcon;
  readonly PiggyBankIcon = PiggyBankIcon;
  readonly TrendingUpIcon = TrendingUpIcon;
  readonly XIcon = XIcon;
  readonly UserIcon = UserIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly SettingsIcon = SettingsIcon;

  isOpen = input<boolean>(false);
  userName = input<string>('');
  userEmail = input<string>('');
  userInitial = input<string>('');
  
  closeSidebar = output<void>();

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, exact: true },
    { path: '/dashboard/transactions', label: 'Movimientos', icon: WalletIcon, exact: false },
    { path: '/dashboard/goals', label: 'Metas de Ahorro', icon: PiggyBankIcon, exact: false },
    { path: '/dashboard/reports', label: 'Reportes', icon: TrendingUpIcon, exact: false },
    { path: '/dashboard/account', label: 'Mi Cuenta', icon: UserIcon, exact: false },
    { path: '/dashboard/subscription', label: 'Suscripción', icon: ShieldIcon, exact: false },
    { path: '/dashboard/payment-methods', label: 'Métodos de Pago', icon: CreditCardIcon, exact: false },
  ];

  // Configuración / Admin (separador visual)
  settingsItems = [
    { path: '/dashboard/settings', label: 'Configuración', icon: SettingsIcon, exact: false },
  ];
}