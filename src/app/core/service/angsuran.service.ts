import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { angsuranGet } from '../model/response/angsuran-response.model';
import { generateAngsuranRequest } from '../model/request/angsuran-request.model';

@Injectable({ providedIn: 'root' })
export class AngsuranService {
    private readonly http = inject(HttpClient);
    private readonly anguranUrl = `${environment.apiUrl}/angsuran/generate`;

     generate(transPinjamanId: number, tenor: number): Observable<angsuranGet[]> {
        const payload: generateAngsuranRequest = { transPinjamanId, tenor };
        return this.http.post<angsuranGet[]>(`${this.anguranUrl}`, payload);
    }
}
