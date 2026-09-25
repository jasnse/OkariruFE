import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { authInterceptor } from '../../core/auth/auth.interceptor';
import { environment } from '../../../environments/environment';
import { Login } from './login';

// integration test
describe('Login (integration)', () => {
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('submit form memicu POST asli ke /login/employe, dan sukses menyimpan token + redirect', () => {
    const component = createComponent();
    component.form.setValue({ username: 'admin', password: 'secret' });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/login/employe`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'secret' });

    req.flush({ username: 'admin', role: 'SUPERADMIN', token: 'jwt-asli' });

    // efek samping AuthService yang beneran (bukan spy) harus kejadian
    expect(localStorage.getItem('Token')).toBe('jwt-asli');
    expect(localStorage.getItem('Username')).toBe('admin');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/master/dashboard']);
    expect(component.errorMessage()).toBe('');
  });

  it('response error dari backend asli ditangkap dan ditampilkan lewat AuthService/interceptor beneran', () => {
    const component = createComponent();
    component.form.setValue({ username: 'admin', password: 'salah' });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/login/employe`);
    req.flush({ message: 'Username atau password salah' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMessage()).toBe('Username atau password salah');
    expect(localStorage.getItem('Token')).toBeNull();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
