import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { customerGet } from '../model/response/customer-response.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/customer`;

    getById(id: number): Observable<customerGet> {
        return this.http.get<customerGet>(this.baseUrl, {
            headers: new HttpHeaders({ idCustomerSearch: String(id) })
        })
    }
}
