import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
        // backend ngasih path relatif "/api/v1/...". Di prod itu udah bener langsung
        // (environment.apiUrl juga relatif, kena rewrite Vercel), tapi di dev environment.apiUrl
        // itu absolut (http://localhost:8080/api/v1) karena FE & BE beda origin/port pas lokal.
        // Jadi "/api/v1" di depan path backend ditukar ke environment.apiUrl biar konsisten di kedua mode.
        const resolvedUrl = url.startsWith('/api/v1')
            ? url.replace('/api/v1', environment.apiUrl)
            : url;
        return this.http.get(resolvedUrl, { responseType: 'blob' })
    }
}
