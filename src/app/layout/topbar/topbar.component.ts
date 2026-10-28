import { Component, input, output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, MenuIcon, UserIcon, SettingsIcon, LogOutIcon, ChevronDownIcon } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  readonly MenuIcon = MenuIcon;
  readonly UserIcon = UserIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly LogOutIcon = LogOutIcon;
  readonly ChevronDownIcon = ChevronDownIcon;

  userName = input<string>('');
  userEmail = input<string>('');
  userInitial = input<string>('');
  
  openSidebar = output<void>();
  
  isMenuOpen = signal(false);

  constructor(private authService: AuthService) {}

  toggleUserMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  handleLogout() {
    this.closeMenu();
    this.authService.logout();
  }

  // Cierra el menú si se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeMenu();
    }
  }
}