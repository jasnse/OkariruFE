import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    const role = authService.getRole();

    if (!token || !role || !allowedRoles.includes(role)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
}