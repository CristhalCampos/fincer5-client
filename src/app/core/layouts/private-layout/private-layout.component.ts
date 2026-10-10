import { Component, OnInit, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  MenuIcon,
  XIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  WalletIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  ChevronDownIcon,
  UserIcon,
  SettingsIcon
} from 'lucide-angular';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucideAngularModule
  ],
  templateUrl: './private-layout.component.html'
})
export class PrivateLayoutComponent implements OnInit {
  readonly MenuIcon = MenuIcon;
  readonly XIcon = XIcon;
  readonly LogOutIcon = LogOutIcon;
  readonly LayoutDashboardIcon = LayoutDashboardIcon;
  readonly WalletIcon = WalletIcon;
  readonly PiggyBankIcon = PiggyBankIcon;
  readonly TrendingUpIcon = TrendingUpIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly UserIcon = UserIcon;
  readonly SettingsIcon = SettingsIcon;

  user: User | null = null;
  
  // Signals para estado reactivo
  isSidebarOpen = signal(false);
  isUserMenuOpen = signal(false);
  isMobile = signal(false);
  isTablet = signal(false);

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => this.user = user);
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 768);
      this.isTablet.set(window.innerWidth >= 768 && window.innerWidth < 1024);
      // Auto-cerrar sidebar en desktop
      if (window.innerWidth >= 1024) {
        this.isSidebarOpen.set(false);
      }
      // Auto-cerrar user menu al redimensionar
      this.isUserMenuOpen.set(false);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }

  // Computed para clases CSS dinámicas
  sidebarTransform = computed(() => 
    this.isSidebarOpen() ? 'translate-x-0' : '-translate-x-full'
  );

  // Cerrar user menu al hacer click fuera
  @HostListener('document:click')
  onDocumentClick() {
    this.isUserMenuOpen.set(false);
  }
}