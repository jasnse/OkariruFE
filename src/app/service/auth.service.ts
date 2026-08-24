import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, tap} from 'rxjs';
import { SKIP_AUTH } from '../auth/skip-auth.context';
import { Router } from '@angular/router';
import { loginRequest } from '../model/request/auth-request.model';
import { loginResponse } from '../model/response/auth-response.model';

@Injectable({providedIn: 'root'})
export class AuthService {

    private readonly baseUrl = `${environment.apiUrl}/login`

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router
    ) {}

    loginEmploye(payload: loginRequest): Observable<loginResponse>{
        return this.http.post<loginResponse>(`${this.baseUrl}/employe`, payload, {
            context: new HttpContext().set(SKIP_AUTH, true) // gak perlu auth
        }) .pipe(tap(res => {
            this.setToken(res.token);
            localStorage.setItem("Username", res.username);
        }));

    }

    logout(){
    localStorage.clear();

    this.router.navigate(['/login'])
    }


    private setToken(token: string){
        localStorage.setItem("Token",token)
    }


    getToken(): string | null {
        return localStorage.getItem("Token");
    }

    getRole(): string | null {
        const token = this.getToken();
        if (!token) return null;

        const payload = this.decodeToken(token);
        return payload?.role ?? null;
    }

    getUsername(): string | null {
        return localStorage.getItem("Username");
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    }
}
