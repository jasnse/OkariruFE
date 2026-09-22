import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../model/shared/page-response.model';
import { pinjamanTrxGet } from '../model/response/pinjamanTrx-response.model';
import {
    pinjamanTransactionUpdate,
    pinjamanTransactionReview,
    pinjamanTransactionApproval,
    pinjamanTransactionDisburse,
} from '../model/request/pinjamanTrx-request.model';

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

    // koreksi data master oleh SUPERADMIN saja (bukan buat alur kerja staff)
    update(id: number, payload: pinjamanTransactionUpdate): Observable<any> {
        return this.http.put(this.baseUrl, payload, {
            params: { id }
        })
    }

    // tahap review oleh MARKETING: Pengajuan -> Direview
    review(id: number, payload: pinjamanTransactionReview): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}/review`, payload);
    }

    // tahap approval oleh BRANCH_MANAGER: Direview -> Disetujui/Ditolak
    approval(id: number, payload: pinjamanTransactionApproval): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}/approval`, payload);
    }

    // tahap pencairan oleh BACKOFFICE: Disetujui -> Dicairkan
    disburse(id: number, payload: pinjamanTransactionDisburse): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}/disburse`, payload);
    }

}
