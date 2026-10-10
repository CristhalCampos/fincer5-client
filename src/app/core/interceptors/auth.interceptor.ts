import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Excluimos las rutas de autenticación del mecanismo de reintentos
  // para evitar bucles infinitos si el refresh token también está vencido.
  const isAuthUrl = req.url.includes('/auth/refresh') || req.url.includes('/auth/logout');

  // 1. Clonar la petición base
  const authReq = req.clone({
    withCredentials: true, // SIEMPRE true para enviar/recibir la cookie HttpOnly
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // 2. Procesar la petición y vigilar errores 401
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Si es 401 y NO es una petición de refresh o logout
      if (error.status === 401 && !isAuthUrl) {
        
        // Intentamos renovar el token de forma silenciosa
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // Si tuvo éxito, reintentamos la petición original con el nuevo token
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Si el refresh también falla (ej. pasaron los 7 días o se revocó),
            // limpiamos todo y mandamos al usuario al login.
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Para cualquier otro error (400, 404, 500, etc.), lo dejamos pasar
      return throwError(() => error);
    })
  );
};