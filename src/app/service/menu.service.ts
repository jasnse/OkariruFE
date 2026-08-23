import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface MenuItem {
    menuId: number;
    namaMenu: string;
    path: string;
    icon: string;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/menu`;

    getMyMenu(): Observable<MenuItem[]> {
        return this.http.get<MenuItem[]>(`${this.baseUrl}/my-menu`);
    }
}