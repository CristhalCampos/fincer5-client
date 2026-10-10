import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject, from, switchMap, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { toObservable } from '@angular/core/rxjs-interop';

export interface UserPreferences {
  displayCurrency: 'USD' | 'VES';
  hasRecurringExpenses: boolean;
  hasFixedIncome: boolean;
  hasSavingsGoals: boolean;
  hasFreelanceIncome: boolean;
  hasClientInvoices: boolean;
  hasProviders?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  accountType?: 'PERSONAL' | 'PROFESSIONAL' | 'COMBINED';
  isConfigured: boolean;
  preferences?: UserPreferences;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // ✅ SIGNALS: Estado reactivo moderno
  private accessToken = signal<string | null>(null);
  private currentUser = signal<User | null>(null);
  private isRestoringSession = signal(true); // Para saber si estamos restaurando sesión
  
  // Computed signals (se actualizan automáticamente)
  public isLoggedIn = computed(() => this.currentUser() !== null);
  public isConfigured = computed(() => this.currentUser()?.isConfigured ?? false);
  public restoringSession = computed(() => this.isRestoringSession());

  // ✅ GETTER PÚBLICO para currentUser (necesario para el guard)
  get currentUserSignal() {
    return this.currentUser;
  }

  // ✅ REAL OBSERVABLE: Para compatibilidad con async pipe y RxJS
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Sincronizar signal con BehaviorSubject
    effect(() => {
      this.currentUserSubject.next(this.currentUser());
    });
    
    this.checkSessionOnStart().subscribe();
  }

  // Petición inicial para recuperar el accessToken si la pestaña se recargó
  checkSessionOnStart(): Observable<any> {
    return this.refreshToken().pipe(
      tap(() => {
        this.isRestoringSession.set(false);
      }),
      catchError(() => {
        this.accessToken.set(null);
        this.currentUser.set(null);
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
  loginWithGoogle(googleData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/google`,
      { ...googleData, userAgent: navigator.userAgent },
      { withCredentials: true }
    ).pipe(tap(res => this.handleAuthentication(res)));
  }

  // 4. Completar el onboarding
  completeOnboarding(onboardingData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/complete-onboarding`,
      onboardingData,
      { withCredentials: true }
    ).pipe(
      switchMap(() => {
        // ✅ ACTUALIZAR USER SIGNAL: Refrescar perfil después de onboarding
        return this.getProfile().pipe(
          tap(user => {
            // Actualizar signal con datos frescos del backend
            const currentUser = this.currentUser();
            if (currentUser) {
              this.currentUser.set({ ...currentUser, ...user, isConfigured: true });
            }
          })
        );
      })
    );
  }

  // 5. Obtener el perfil del usuario
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  // 6. Renovación del token (Petición silenciosa)
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

  // Forzar actualización del usuario (útil después de cambios en preferencias)
  refreshUserProfile(): Observable<User> {
    return this.getProfile().pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }

  // Guardar tokens en memoria
  private handleAuthentication(res: AuthResponse) {
    if (res.accessToken) {
      this.accessToken.set(res.accessToken);
      this.currentUser.set(res.user);
    }
  }

  // 7. Cerrar sesión
  logout() {
    this.accessToken.set(null);
    this.currentUser.set(null);
    
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }
}