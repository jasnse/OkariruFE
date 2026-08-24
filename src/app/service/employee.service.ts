import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { Employee } from '../model/response/employee-response.model';
import { AddEmployeeRequest, updateEmpCredential } from '../model/request/employee-request.model';
import { PageResponse } from '../model/shared/page-response.model';

@Injectable({providedIn: 'root'})
export class EmployeeService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/employees`;

    getAll(page = 0, size = 5, keyword = ''): Observable<PageResponse<Employee>> {
        return this.http.get<PageResponse<Employee>>(this.baseUrl, {
    params: { page, size, keyword }
    });
    }

    add(payload: AddEmployeeRequest): Observable<any> {
    return this.http.post(this.baseUrl, payload);
    }

    update(id: number, payload: updateEmpCredential): Observable<any> {
    return this.http.put(this.baseUrl, payload, {
    params: { id }
    });
    }

    delete(id: number): Observable<any> {
    return this.http.delete(this.baseUrl, {
    params: { id }
    });
}



}
