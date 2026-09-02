import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { SKIP_AUTH } from './skip-auth.context';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();
  const router = inject(Router);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tangkap response 401 (Unauthorized) atau 403 (Forbidden) saat token expired
      if (error.status === 401) {
        // Hapus token/session yang tersimpan
        localStorage.removeItem('token');
        authService.logout(); 

        // 2. Redirect ke halaman login
        router.navigate(['/login'], {
          queryParams: { expired: 'true' }
        });
      }

      return throwError(() => error);
    })
  );
  
};