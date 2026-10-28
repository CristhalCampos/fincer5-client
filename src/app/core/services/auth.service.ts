import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// --- MODELOS COMPARTIDOS ---
import {
  User,
  UserPreferences,
  AuthResponse,
  OnboardingRequest,
  GoogleLoginRequest,
  OnboardingResponse,
  UserRole,
  AccountType,
  Subscription,
  Plan,
  PaymentMethod,
  SubscriptionStatus,
  PaymentProvider,
  SubscriptionRenewal,
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // SIGNALS: Estado reactivo moderno
  private accessToken = signal<string | null>(null);
  private currentUser = signal<User | null>(null);
  private isRestoringSession = signal(true);
  
  // Computed signals
  public isLoggedIn = computed(() => this.currentUser() !== null);
  public isConfigured = computed(() => this.currentUser()?.isConfigured ?? false);
  public restoringSession = computed(() => this.isRestoringSession());

  // Getter público para el guard
  get currentUserSignal() {
    return this.currentUser;
  }

  // REAL OBSERVABLE: Para compatibilidad con async pipe
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Sincronizar signal con BehaviorSubject
    effect(() => {
      this.currentUserSubject.next(this.currentUser());
    });
    
    // Iniciar verificación de sesión al arrancar el servicio
    this.checkSessionOnStart().subscribe();
  }

  // 0. Verificación inicial de sesión
  checkSessionOnStart(): Observable<AuthResponse | null> {
    return this.refreshToken().pipe(
      tap(() => this.isRestoringSession.set(false)),
      catchError(() => {
        this.clearSession();
        this.isRestoringSession.set(false);
        return of(null);
      })
    );
  }

  // 1. Enviar correo para recibir el código OTP
  loginLocal(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-local`, { email });
  }

  // 2. Verificar el código OTP
  verifyOtp(email: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/verify-otp`,
      { email, code, userAgent: navigator.userAgent },
      { withCredentials: true }
    ).pipe(tap(res => this.handleAuthentication(res)));
  }

  // 3. Iniciar sesión con Google
  loginWithGoogle(googleData: GoogleLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/google`,
      googleData,
      { withCredentials: true }
    ).pipe(tap(res => this.handleAuthentication(res)));
  }

  // 4. Completar el onboarding
  completeOnboarding(onboardingData: OnboardingRequest): Observable<User> {
    return this.http.post<OnboardingResponse>(
      `${this.apiUrl}/complete-onboarding`,
      onboardingData,
      { withCredentials: true }
    ).pipe(
      // switchMap para obtener el perfil fresco y actualizado
      switchMap(() => {
        return this.getProfile().pipe(
          tap(user => {
            // Aseguramos que isConfigured esté en true tras el onboarding exitoso
            this.currentUser.set({ ...user, isConfigured: true });
          })
        );
      })
    );
  }

  // 5. Obtener el perfil del usuario
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  // 6. Renovación del token
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.accessToken.set(res.accessToken);
        this.currentUser.set(res.user);
      })
    );
  }

  // 7. Forzar actualización del usuario
  refreshUserProfile(): Observable<User> {
    return this.getProfile().pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  // 8. Cerrar sesión
  logout(): Observable<void> {
    this.clearSession();
    
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.router.navigate(['/auth/login'])),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(undefined);
      })
    );
  }

  // 9. Limpieza de estado
  clearSession(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  // Getter para el interceptor
  getAccessToken(): string | null {
    return this.accessToken();
  }

  // Privado: Manejo centralizado de la respuesta exitosa de auth
  private handleAuthentication(res: AuthResponse): void {
    if (res.accessToken && res.user) {
      this.accessToken.set(res.accessToken);
      this.currentUser.set(res.user);
    }
  }
}

// ==========================================
// SERVICIO DE SUSCRIPCIONES (Client-side)
// ==========================================

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) {}

  getMySubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`, { withCredentials: true });
  }

  getRenewalHistory(): Observable<SubscriptionRenewal[]> {
    return this.http.get<SubscriptionRenewal[]>(`${this.apiUrl}/history`, { withCredentials: true });
  }

  renewSubscription(dto: { planId: string; paymentMethodId: string; amount: number; provider: PaymentProvider }): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/renew`, dto, { withCredentials: true });
  }

  cancelSubscription(): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/cancel`, {}, { withCredentials: true });
  }

  // Helpers para UI
  hasActivePremium(subscription: Subscription | undefined | null): boolean {
    return subscription?.status === SubscriptionStatus.ACTIVE && subscription?.plan.name.startsWith('PREMIUM');
  }

  getSubscriptionStatusLabel(status: SubscriptionStatus | string): string {
    const labels: Record<string, string> = {
      [SubscriptionStatus.ACTIVE]: 'Activa',
      [SubscriptionStatus.CANCELED]: 'Cancelada',
      [SubscriptionStatus.EXPIRED]: 'Expirada',
      [SubscriptionStatus.FAILED]: 'Pago fallido',
      'UNKNOWN': 'Desconocido',
    };
    return labels[status] || status;
  }

  getPlanDisplayName(plan: Plan): string {
    return plan.displayName || plan.name;
  }

  getDaysUntilExpiration(subscription: Subscription | null | undefined): number | null {
    if (!subscription?.endDate) return null;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  isInGracePeriod(subscription: Subscription | null | undefined): boolean {
    if (!subscription?.gracePeriodEndsAt) return false;
    return new Date(subscription.gracePeriodEndsAt) > new Date();
  }
}

// ==========================================
// SERVICIO DE PAGOS (Client-side)
// ==========================================

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/methods`, { withCredentials: true });
  }

  createPaymentMethod(dto: { provider: PaymentProvider; externalEmail?: string; bankName?: string; idNumber?: string; phoneNumber?: string; isDefault?: boolean }): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.apiUrl}/methods`, dto, { withCredentials: true });
  }

  setDefaultPaymentMethod(id: string): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.apiUrl}/methods/${id}/default`, {}, { withCredentials: true });
  }

  deletePaymentMethod(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/methods/${id}`, { withCredentials: true });
  }

  processManualPayment(dto: { planId: string; paymentMethodId: string; amount: number; reference?: string }): Observable<{ success: boolean; subscription: Subscription }> {
    return this.http.post<{ success: boolean; subscription: Subscription }>(`${this.apiUrl}/process-manual`, dto, { withCredentials: true });
  }

  verifyBinancePayment(dto: { txHash: string; expectedAmount: number; expectedAddress: string }): Observable<{ verified: boolean; transactionId?: string }> {
    return this.http.post<{ verified: boolean; transactionId?: string }>(`${this.apiUrl}/verify/binance`, dto, { withCredentials: true });
  }

  verifyPayPalPayment(dto: { orderId: string; expectedAmount: number }): Observable<{ verified: boolean; transactionId?: string }> {
    return this.http.post<{ verified: boolean; transactionId?: string }>(`${this.apiUrl}/verify/paypal`, dto, { withCredentials: true });
  }

  verifyMobilePayment(dto: { bankName: string; phoneNumber: string; amount: number; reference: string }): Observable<{ verified: boolean; transactionId?: string }> {
    return this.http.post<{ verified: boolean; transactionId?: string }>(`${this.apiUrl}/verify/mobile`, dto, { withCredentials: true });
  }

  // Helpers para UI
  getProviderDisplayName(provider: PaymentProvider): string {
    const names: Record<PaymentProvider, string> = {
      [PaymentProvider.BINANCE]: 'Binance (USDT/BTC)',
      [PaymentProvider.PAYPAL]: 'PayPal',
      [PaymentProvider.MANUAL]: 'Pago Móvil / Transferencia',
    };
    return names[provider] || provider;
  }

  getProviderIcon(provider: PaymentProvider): string {
    const icons: Record<PaymentProvider, string> = {
      [PaymentProvider.BINANCE]: 'bitcoin',
      [PaymentProvider.PAYPAL]: 'paypal',
      [PaymentProvider.MANUAL]: 'smartphone',
    };
    return icons[provider] || 'credit-card';
  }
}