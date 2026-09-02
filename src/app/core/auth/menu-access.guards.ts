import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { MenuService } from '../service/menu.service';

export const menuAccessGuard: CanActivateFn = (route, state) => {
    const menuService = inject(MenuService);
    const router = inject(Router);


    // cek di GET/my-menu apakah URL yang diakses ada di daftar path menu milik user itu. Kalau nggak ketemu → redirect
    return menuService.getMyMenu().pipe(
    map(menus => {
        const isAllowed = menus.some(m => m.path === state.url || state.url.startsWith(m.path + '/'));
        if (!isAllowed) {
            router.navigate(['/master/dashboard']);
            return false;
        }
        return true;
    }),
    catchError(() => {
        router.navigate(['/login']);
        return of(false);
    })
    );
};