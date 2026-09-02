import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RoleGroupResponse, RoleGroupMemberResponse, rGRoleResponse, employeNonRg } from '../model/response/roleGroup-response.model';
import { roleGroupAdd, roleGroupUpdate } from '../model/request/roleGroup-request.model';
import { PageResponse } from '../model/shared/page-response.model';


@Injectable({ providedIn: 'root' })

export class RoleGroupServiceTs {

    readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/roleGroup`;
    private readonly roleUrl = `${environment.apiUrl}/roles`

    getAllRg(keyword = ''): Observable<RoleGroupResponse[]>{
        return this.http.get<RoleGroupResponse[]>(`${this.baseUrl}`, {
            params: {keyword }
        })
    }

    add(payload: roleGroupAdd): Observable<RoleGroupResponse>{
        return this.http.post<RoleGroupResponse>(`${this.baseUrl}`, payload)
    }

    getById(id: number): Observable<RoleGroupResponse>{
        return this.http.get<RoleGroupResponse>(`${this.baseUrl}`, {
            headers: new HttpHeaders({ idRoleGroupSearch: String(id) })
        })
    }

    getMembers(roleGroupId: number, page = 0, size = 10, keyword = ''): Observable<PageResponse<RoleGroupMemberResponse>>{
        return this.http.get<PageResponse<RoleGroupMemberResponse>>(`${this.baseUrl}/employees`, {
            params: { roleGroupId, page, size, keyword }
            })
    }

    getEmployeeNonRg(): Observable<employeNonRg[]>{
        return this.http.get<employeNonRg[]>(`${this.baseUrl}/employees/add`)

    }

    getRoleById(roleId: number): Observable<rGRoleResponse>{
        return this.http.get<rGRoleResponse>(`${this.roleUrl}`, {
            headers: new HttpHeaders({idRoleSearch: String(roleId)})
        })
    }

    updateRg(id: number, payload: roleGroupUpdate): Observable<any>{
        return this.http.put(this.baseUrl, payload, {
            params: {id}
        })

    }

    deleteRg(Id: number): Observable<any> {
        return this.http.delete(this.baseUrl, {
            params: {Id}
        })
    }

    assignEmployee(roleGroupId: number, employeeId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees`, { employeeId }, {
        params: { roleGroupId }
    });
}
    removeEmploye(roleGroupId: number, employeeId: number): Observable<any>{
        return this.http.delete(`${this.baseUrl}/employees`, {
            params: {roleGroupId, employeeId}
        });
    }

}
