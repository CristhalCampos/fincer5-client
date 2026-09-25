import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // 1. Clonar la petición base
  // Siempre inyectamos 'withCredentials: true' para que viajen las cookies HttpOnly.
  // Si el accessToken existe en la RAM, lo añadimos a la cabecera Authorization.
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // 2. Procesar la petición y vigilar si el backend devuelve un error 401
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Si el error es 401 (No autorizado) y NO estamos intentando refrescar ya el token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        
        // Disparamos el flujo reactivo para renovar el Access Token de forma silenciosa
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // Si la renovación fue exitosa, clonamos de nuevo la petición original
            // pero esta vez con el nuevo Access Token que acaba de llegar
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            
            // Reintentamos la petición fallida de forma transparente para el usuario
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Si el refreshToken también venció (ej. pasaron los 7 días),
            // limpiamos la sesión en el frontend y lo mandamos al login
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Si es cualquier otro tipo de error (400, 404, 500, etc.), lo dejamos pasar normalmente
      return throwError(() => error);
    })
  );
};