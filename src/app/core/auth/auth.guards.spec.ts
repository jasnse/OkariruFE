import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { roleGuard } from './auth.guards';

describe('roleGuard', () => {
  let authServiceSpy: { getToken: ReturnType<typeof vi.fn>; getRole: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceSpy = { getToken: vi.fn(), getRole: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  function runGuard(allowedRoles: string[]) {
    return TestBed.runInInjectionContext(() =>
      roleGuard(allowedRoles)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('menolak akses dan redirect ke /login kalau tidak ada token', () => {
    authServiceSpy.getToken.mockReturnValue(null);
    authServiceSpy.getRole.mockReturnValue(null);

    const result = runGuard(['SUPERADMIN']);

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('menolak akses kalau role user tidak termasuk allowedRoles', () => {
    authServiceSpy.getToken.mockReturnValue('token-valid');
    authServiceSpy.getRole.mockReturnValue('MARKETING');

    const result = runGuard(['SUPERADMIN', 'BACKOFFICE']);

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('mengizinkan akses kalau role user termasuk allowedRoles', () => {
    authServiceSpy.getToken.mockReturnValue('token-valid');
    authServiceSpy.getRole.mockReturnValue('SUPERADMIN');

    const result = runGuard(['SUPERADMIN', 'BACKOFFICE']);

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
