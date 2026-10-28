import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../../layout/topbar/topbar.component';
import { getUserInitial } from '../../../core/utils/get-user-initial';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    TopbarComponent
  ],
  templateUrl: './private-layout.component.html'
})
export class PrivateLayoutComponent {
  isSidebarOpen = signal(false);

  // Computed signals para obtener datos del usuario de forma reactiva
  private user = computed(() => this.authService.currentUserSignal());
  userName = computed(() => this.user()?.name || this.user()?.username || 'Usuario');
  userEmail = computed(() => this.user()?.email || '');
  userInitial = computed(() => getUserInitial(this.user()?.name, this.user()?.username));

  constructor(private authService: AuthService) {}

  openSidebar() {
    this.isSidebarOpen.set(true);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }
}