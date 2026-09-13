import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../model/shared/page-response.model';
import { pinjamanTrxGet } from '../model/response/pinjamanTrx-response.model';
import { pinjamanTransactionUpdate } from '../model/request/pinjamanTrx-request.model';

@Injectable({ providedIn: 'root' })
export class PinjamanTransactionService {

    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/pinjaman/transaction`;

        getAll(page = 0, size = 5, keyword = '', status?: string): Observable<PageResponse<pinjamanTrxGet>> {
            const params: Record<string, any> = { page, size, keyword };
            if (status) {
                params['status'] = status;
            }
            return this.http.get<PageResponse<pinjamanTrxGet>>(this.baseUrl, { params });
        }

    getById(id: number): Observable<pinjamanTrxGet> {
        return this.http.get<pinjamanTrxGet>(this.baseUrl, {
            headers: new HttpHeaders({ idPinjamanTransactionSearch: String(id) })
        })
    }

    update(id: number, payload: pinjamanTransactionUpdate): Observable<any> {
        return this.http.put(this.baseUrl, payload, {
            params: { id }
        })
    }

}
