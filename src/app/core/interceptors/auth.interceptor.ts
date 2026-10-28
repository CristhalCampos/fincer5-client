import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  const isAuthUrl = req.url.includes('/auth/refresh') || req.url.includes('/auth/logout');

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Manejo de error 403 Forbidden desde el Backend
      if (error.status === 403) {
        // Redirigimos a la página de unauthorized
        router.navigate(['/unauthorized']);
        // Retornamos EMPTY para detener la cadena de error y que no salte en consola innecesariamente
        return EMPTY;
      }

      // Manejo de error 401 Unauthorized (Token expirado)
      if (error.status === 401 && !isAuthUrl) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // USAR clearSession en lugar de logout()
            authService.clearSession();
            
            // Opcional: limpiar cookies del lado del cliente si las tienes (aunque HttpOnly las maneja el navegador)
          
            return throwError(() => refreshError);
          })
        );
      }

      // Para cualquier otro error (400, 404 de API, 500), lo dejamos pasar al componente
      return throwError(() => error);
    })
  );
};