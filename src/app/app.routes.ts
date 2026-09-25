import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/public/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/public/faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/public/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/public/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/public/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/verify-otp',
    loadComponent: () => import('./pages/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
  },
  {
    path: 'auth/onboarding',
    loadComponent: () => import('./pages/auth/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/private/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  // Redirección por defecto
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
