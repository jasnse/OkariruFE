import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { MenuItem } from '../model/response/menu-response.model';
import { environment } from '../../../environments/environment';
import { menuAccessGuard } from './menu-access.guards';

// integration test: pakai MenuService ASLI, cuma boundary HTTP-nya yang di-mock lewat
// HttpTestingController. Beda dari auth.guards.spec.ts (roleGuard) yang murni unit test
// karena gak ada service/HTTP yang terlibat sama sekali di situ.
describe('menuAccessGuard (integration)', () => {
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function runGuard(url: string) {
    const result = TestBed.runInInjectionContext(() =>
      menuAccessGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
    return isObservable(result) ? firstValueFrom(result) : Promise.resolve(result);
  }

  const menus: MenuItem[] = [
    { menuId: 1, namaMenu: 'Master User', path: '/master/master-user', icon: 'users' },
    { menuId: 2, namaMenu: 'Dashboard', path: '/master/dashboard', icon: 'home' },
  ];

  it('memanggil GET /menu/my-menu asli dan mengizinkan akses kalau path ada di daftar menu', async () => {
    const promise = runGuard('/master/master-user');

    const req = httpMock.expectOne(`${environment.apiUrl}/menu/my-menu`);
    expect(req.request.method).toBe('GET');
    req.flush(menus);

    expect(await promise).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('menolak akses dan redirect ke /master/dashboard kalau path gak ada di daftar menu', async () => {
    const promise = runGuard('/master/role-group');

    const req = httpMock.expectOne(`${environment.apiUrl}/menu/my-menu`);
    req.flush(menus);

    expect(await promise).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/master/dashboard']);
  });

  it('redirect ke /login kalau request my-menu gagal (mis. sesi invalid)', async () => {
    const promise = runGuard('/master/dashboard');

    const req = httpMock.expectOne(`${environment.apiUrl}/menu/my-menu`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(await promise).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
