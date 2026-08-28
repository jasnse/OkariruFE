import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../model/shared/page-response.model';
import { Role } from '../model/response/role-response.model';
import { roleAdd, roleEdit } from '../model/request/role-request.model';

@Injectable({ providedIn: 'root' })

export class RoleService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/roles`;

    getAll(page = 0, size = 5, keyword = ''): Observable<PageResponse<Role>> {
    return this.http.get<PageResponse<Role>>(this.baseUrl, {
    params: { page, size, keyword }
    });
    }

    // add(payload: roleAdd): Observable<any> {
    //     return this.http.post(this.baseUrl, payload)
    // }


    // update(id: number, payload: roleEdit): Observable<any>{
    //     return this.http.put(this.baseUrl, payload, {
    //         params: {id}
    //     })
    // }

    // delete(Id: number){
    //     return this.http.delete(this.baseUrl, {
    // params: { Id }
    // });
    // }
}
