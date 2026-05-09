import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <nav class="flex justify-between items-center py-4 px-[5%] shadow-lg transition-colors duration-300 bg-(--surface-color)">
      <!-- Logo -->
      <div class="rubik-title text-2xl font-bold text-(--text-color)">
        fincer<span class="text-(--accent-color)">5</span>
      </div>

      <!-- Links de navegación -->
      <div class="flex gap-4 items-center">
        @let linkStyles = "px-2 py-1 text-(--text-color) font-medium transition-all hover:opacity-80";
        @let activeStyles = "text-(--accent-color) border-b-2 border-(--accent-color)";

        <a routerLink="/home"
           routerLinkActive
           #rlaHome="routerLinkActive"
           [class]="linkStyles"
           [class.active-link]="rlaHome.isActive"
           [ngClass]="rlaHome.isActive ? activeStyles : ''">Inicio</a>

        <a routerLink="/about"
           routerLinkActive
           #rlaAbout="routerLinkActive"
           [class]="linkStyles"
           [ngClass]="rlaAbout.isActive ? activeStyles : ''">Nosotros</a>

        <a routerLink="/faq"
           routerLinkActive
           #rlaFaq="routerLinkActive"
           [class]="linkStyles"
           [ngClass]="rlaFaq.isActive ? activeStyles : ''">FAQ</a>

        <a routerLink="/contact"
           routerLinkActive
           #rlaContact="routerLinkActive"
           [class]="linkStyles"
           [ngClass]="rlaContact.isActive ? activeStyles : ''">Contacto</a>
      </div>

      <!-- Acciones -->
      <div class="flex items-center">
        <button
          (click)="theme.toggleTheme()"
          class="text-xl p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
          {{ theme.darkMode() ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  theme = inject(ThemeService);
}