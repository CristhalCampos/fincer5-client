import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './core/layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './core/layouts/private-layout/private-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. RUTAS PÚBLICAS
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'home', loadComponent: () => import('./pages/public/home/home.component').then(m => m.HomeComponent) },
      { path: 'about', loadComponent: () => import('./pages/public/about/about.component').then(m => m.AboutComponent) },
      { path: 'faq', loadComponent: () => import('./pages/public/faq/faq.component').then(m => m.FaqComponent) },
      { path: 'contact', loadComponent: () => import('./pages/public/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'terms', loadComponent: () => import('./pages/public/terms/terms.component').then(m => m.TermsComponent) },
      { path: 'privacy', loadComponent: () => import('./pages/public/privacy/privacy.component').then(m => m.PrivacyComponent) },
      { path: 'not-found', loadComponent: () => import('./pages/errors/not-found/not-found.component').then(m => m.NotFoundComponent) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },
  // 2. RUTAS DE AUTH
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'verify-otp', loadComponent: () => import('./pages/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent) },
      { path: 'onboarding', loadComponent: () => import('./pages/auth/onboarding/onboarding.component').then(m => m.OnboardingComponent) },
    ]
  },
  // 3. RUTAS PRIVADAS (Dashboard + Account + Subscription)
  {
    path: 'dashboard',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    data: { expectedRoles: ['REGULAR', 'PREMIUM', 'ADMIN'] },
    children: [
      { path: '', loadComponent: () => import('./pages/private/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'account', loadComponent: () => import('./pages/private/account/account.component').then(m => m.AccountComponent) },
      { path: 'subscription', loadComponent: () => import('./pages/private/subscription/subscription.component').then(m => m.SubscriptionComponent) },
      { path: 'payment-methods', loadComponent: () => import('./pages/private/payment-methods/payment-methods.component').then(m => m.PaymentMethodsComponent) },
    ]
  },
  // 4. RUTA EXCLUSIVAMENTE PARA ADMIN
  // {
  //   path: 'admin/users',
  //   component: PrivateLayoutComponent,
  //   canActivate: [authGuard],
  //   data: {
  //     expectedRoles: ['ADMIN']
  //   },
  //   children: [
  //     { path: '', component: UserManagementComponent },
  //   ]
  // },
  // Ruta de unauthorized
  { path: 'unauthorized', loadComponent: () => import('./pages/errors/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  // Wildcard route para manejar todo lo que no coincida
  { path: '**', redirectTo: 'not-found' }
];
