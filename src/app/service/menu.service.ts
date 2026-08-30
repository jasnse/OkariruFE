import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem, menu } from '../model/response/menu-response.model';
import { PageResponse } from '../model/shared/page-response.model';
import { addMenuRequest, updateMenu } from '../model/request/menu-request.model';
import { menuAssignedResponse } from '../model/response/roleGroup-response.model';


@Injectable({ providedIn: 'root' })
export class MenuService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/menu`;
    private readonly menuGroupUrl = `${environment.apiUrl}/menugroup`;

    // shared state -> dipakai bareng oleh sidebar & halaman master-menu
    private readonly myMenuSignal = signal<MenuItem[]>([]);
    readonly myMenu = this.myMenuSignal.asReadonly();

    
    //shared state agar dinamis di sidebar
    loadMyMenu(): void {
        this.http.get<MenuItem[]>(`${this.baseUrl}/my-menu`).subscribe({
            next: (res) => this.myMenuSignal.set(res)
        });
    }

    getMyMenu(): Observable<MenuItem[]> {
        return this.http.get<MenuItem[]>(`${this.baseUrl}/my-menu`);
    }

    getAll(page = 0, size = 5, keyword = ''): Observable<PageResponse<menu>> {
        return this.http.get<PageResponse<menu>>(`${this.baseUrl}`, {
            params: { page, size, keyword }
        })
    }

    add(payload: addMenuRequest): Observable<any> {
        return this.http.post(this.baseUrl, payload)
    }

    update(id: number, payload: updateMenu): Observable<any> {
    return this.http.put(this.baseUrl, payload, {
    params: { id }
    });
    }

    delete(Id: number){
        return this.http.delete(this.baseUrl, {
    params: { Id }
    });
    }

    //menu group
    getMenuGroup(roleGroupId:number, page = 0, size = 5, keyword = ''): Observable<PageResponse<menuAssignedResponse>>{
        return this.http.get<PageResponse<menuAssignedResponse>>(this.menuGroupUrl, {
            params: {roleGroupId, keyword, page, size}
        })
    }

    addMenuGroup(menuId: number, roleGroupId: number): Observable<any> {
        return this.http.post(this.menuGroupUrl, { menuId, roleGroupId })
    }

    getMenusNotInRoleGroup(roleGroupId: number): Observable<menu[]> {
    return this.http.get<menu[]>(`${this.menuGroupUrl}/add`, { params: { roleGroupId } })
}

    deleteMenuGroup(Id: number){
        return this.http.delete(this.menuGroupUrl, {params: {Id}})
    }


}
