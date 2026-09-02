import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../model/shared/page-response.model';
import { pinjamanGet } from '../model/response/pinjaman-response.model';
import { pinjamanRequest } from '../model/request/pinjaman-request.model';

@Injectable({providedIn: 'root'})

export class PinjamanService {

    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/pinjaman`;

    getAll(page = 0, size = 5, keyword = ''): Observable<PageResponse<pinjamanGet>> {
    return this.http.get<PageResponse<pinjamanGet>>(`${this.baseUrl}`, {
        params: { page, size, keyword }
    })
    }

    getById(id: number): Observable<pinjamanGet> {
        return this.http.get<pinjamanGet>(this.baseUrl, {
            headers: new HttpHeaders({ idPinjamanSearch: String(id) })
        })
    }

    addPinjaman(payload: pinjamanRequest): Observable<any>{
        return this.http.post(`${environment.apiUrl}/pinjaman`, payload)
    }

    editPinjman(payload: pinjamanRequest, id: number): Observable<any>{
        return this.http.put(`${this.baseUrl}`, payload, {
            params: {id}
        })
    }

    deletePinjaman(Id: number){
        return this.http.delete(`${this.baseUrl}`, {
            params: { Id }
        })
    }
}
