import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return waitForSessionRestored(authService).pipe(
    switchMap(() => {
      const user = authService.currentUserSignal();
      
      if (user) {
        // 1. Verificar si necesita onboarding
        if (!user.isConfigured) {
          router.navigate(['/auth/onboarding']);
          return of(false);
        }

        // 2. Verificar si la ruta requiere roles específicos
        const expectedRoles = (route as ActivatedRouteSnapshot).data['expectedRoles'] as string[] | undefined;
        
        if (expectedRoles && expectedRoles.length > 0) {
          // Si el rol del usuario NO está en el array de roles permitidos
          if (!expectedRoles.includes(user.role)) {
            router.navigate(['/unauthorized']);
            return of(false);
          }
        }

        // Todo en orden, puede pasar
        return of(true);
      }
      
      // 3. Si no hay usuario, redirigir al login
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};

function waitForSessionRestored(authService: AuthService): Observable<void> {
  const restoring$ = toObservable(authService.restoringSession);
  return restoring$.pipe(
    filter(restoring => !restoring),
    take(1),
    map(() => void 0)
  );
}