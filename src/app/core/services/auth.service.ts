import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environmentDev } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environmentDev.apiUrl}/auth`;
  private accessToken: string | null = null;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Al cargar la app, se intenta recuperar la sesión usando la cookie silenciosamente
    this.checkSessionOnStart().subscribe();
  }

  // Petición inicial para recuperar el accessToken si la pestaña se recargó
  checkSessionOnStart(): Observable<any> {
    return this.refreshToken().pipe(
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  // Enviar correo para recibir el código de 6 dígitos
  loginLocal(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-local`, { email });
  }

  // Verificar el código OTP
  verifyOtp(email: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, 
      { email, code, userAgent: navigator.userAgent }, 
      { withCredentials: true })
      .pipe(tap(res => this.handleAuthentication(res)));
  }

  // Iniciar sesión con Google
  loginWithGoogle(googleData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google`, 
      { ...googleData, userAgent: navigator.userAgent }, 
      { withCredentials: true })
      .pipe(tap(res => this.handleAuthentication(res)));
  }

  // Completar el onboarding
  completeOnboarding(onboardingData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/complete-onboarding`, 
      onboardingData, 
      { withCredentials: true }
    );
  }

  // Obtener el perfil del usuario
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  // Renovación del token (Petición silenciosa)
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          this.accessToken = res.accessToken;
          this.currentUserSubject.next(res.user);
        })
      );
  }

  // Guardar tokens
  private handleAuthentication(res: any) {
    if (res.accessToken) {
      this.accessToken = res.accessToken;
      this.currentUserSubject.next(res.user);
    }
  }

  logout() {
    this.accessToken = null; // Limpiamos la memoria
    this.currentUserSubject.next(null);
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return this.accessToken;
  }
}