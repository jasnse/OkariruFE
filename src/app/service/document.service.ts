import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { documentGet } from '../model/response/document-response.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/document`;

    getByCustomerAndTrx(customerId: number, transPinjamanId: number): Observable<documentGet[]> {
        return this.http.get<documentGet[]>(this.baseUrl, {
            params: { customerId, transPinjamanId }
        })
    }

    getFileBlob(url: string): Observable<Blob> {
        return this.http.get(url, { responseType: 'blob' })
    }
}
