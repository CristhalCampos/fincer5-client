import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ ESPERAR a que termine la restauración de sesión
  return waitForSessionRestored(authService).pipe(
    switchMap(() => {
      const user = authService.currentUserSignal();
      
      if (user) {
        if (!user.isConfigured) {
          router.navigate(['/auth/onboarding']);
          return of(false);
        }
        return of(true);
      }
      
      // Si no hay usuario, redirigir al login
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};

/**
 * Espera a que isRestoringSession sea false
 * Si ya es false, emite inmediatamente
 */
function waitForSessionRestored(authService: AuthService): Observable<void> {
  const restoring$ = toObservable(authService.restoringSession);
  
  return restoring$.pipe(
    filter(restoring => !restoring),
    take(1),
    map(() => void 0)
  );
}