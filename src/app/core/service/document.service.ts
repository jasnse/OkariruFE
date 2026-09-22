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
        const resolvedUrl = url.startsWith('/api/v1')
            ? url.replace('/api/v1', environment.apiUrl)
            : url;
        return this.http.get(resolvedUrl, { responseType: 'blob' })
    }
}
