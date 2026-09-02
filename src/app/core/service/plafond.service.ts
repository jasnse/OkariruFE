import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { plafondGet } from '../model/response/plafond-response.model';
import { plafondUpdate } from '../model/request/plafond-request.model';

@Injectable({ providedIn: 'root' })
export class PlafondService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/plafond`;

    getByCustomerId(customerId: number): Observable<plafondGet> {
        return this.http.get<plafondGet>(this.baseUrl, {
            params: { userId: customerId }
        })
    }

    update(id: number, payload: plafondUpdate): Observable<any> {
        return this.http.put(this.baseUrl, payload, {
            params: { id }
        })
    }
}
