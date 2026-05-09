import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { LucideAngularModule, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, LucideAngularModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  theme = inject(ThemeService);
  
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
}