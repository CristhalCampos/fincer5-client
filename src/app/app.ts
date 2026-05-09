import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <!-- <app-footer /> -->
  `
})
export class App {
  protected readonly appName = signal('Fincer5');
  protected readonly slogan = signal('Gestión financiera inteligente');
}
