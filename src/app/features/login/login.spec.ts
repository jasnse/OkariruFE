import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { Login } from './login';

describe('Login', () => {
  let authServiceSpy: { loginEmploye: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceSpy = { loginEmploye: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        // Login.html pakai routerLink, butuh ActivatedRoute buat di-inject RouterLink
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('redirect ke /master/dashboard kalau login sukses dengan role yang dikenal', () => {
    authServiceSpy.loginEmploye.mockReturnValue(
      of({ username: 'admin', role: 'SUPERADMIN', token: 'tkn' }),
    );
    const component = createComponent();

    component.form.setValue({ username: 'admin', password: 'secret' });
    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/master/dashboard']);
    expect(component.errorMessage()).toBe('');
    expect(component.loading()).toBe(false);
  });

  it('menampilkan pesan error kalau role tidak dikenal (bukan employee)', () => {
    authServiceSpy.loginEmploye.mockReturnValue(
      of({ username: 'cust', role: 'CUSTOMER', token: 'tkn' }),
    );
    const component = createComponent();

    component.form.setValue({ username: 'cust', password: 'secret' });
    component.onSubmit();

    expect(component.errorMessage()).toBe('role tidak dikenal');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('menampilkan pesan dari server kalau login gagal', () => {
    authServiceSpy.loginEmploye.mockReturnValue(
      throwError(() => ({ error: { message: 'Username atau password salah' } })),
    );
    const component = createComponent();

    component.form.setValue({ username: 'admin', password: 'salah' });
    component.onSubmit();

    expect(component.errorMessage()).toBe('Username atau password salah');
    expect(component.loading()).toBe(false);
  });
});
