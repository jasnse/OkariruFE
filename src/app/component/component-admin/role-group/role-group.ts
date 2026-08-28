import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { RoleGroupServiceTs } from '../../../service/role-group.service';
import { RoleGroupResponse } from '../../../model/response/roleGroup-response.model';
import { roleGroupAdd } from '../../../model/request/roleGroup-request.model';
import { RoleService } from '../../../service/role.service';
import { Role } from '../../../model/response/role-response.model';

@Component({
  imports: [DatePipe, FormsModule, RouterLink],
  selector: 'app-role-group',
  templateUrl: './role-group.html',
})
export class RoleGroup implements OnInit {
  private readonly rgService = inject(RoleGroupServiceTs)
  private readonly roleService = inject(RoleService)

  

  roleGroups = signal<RoleGroupResponse[]>([]);
  roles = signal<Role[]>([]);
  isLoading = signal<boolean>(true);
  searchKeyword = signal('')

  isModalOpen = false;

  roleGroupForm = {
    roleId: '',
    namaGroupRole: ''
  };

  private reload = signal(0);

  private params = computed(() => ({
    keyword: this.searchKeyword(),
    _r: this.reload()
  }));

  private readonly roleGroups$ = toObservable(this.params).pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(p =>
      this.rgService.getAllRg(p.keyword).pipe(
        catchError(() => of([] as RoleGroupResponse[]))
      )
    )
  );

    loadRoles(){
    this.roleService.getAll(0, 100).subscribe({
      next: (res) => this.roles.set(res.content),
      error: (err) => console.error('Gagal mengambil data role:', err)
    })
  }

    getAllRg(){
    this.roleGroups$.subscribe(res => {
      this.roleGroups.set(res);
      this.isLoading.set(false);
    })
  }

  ngOnInit(){
    this.getAllRg();
    this.loadRoles();
  }

  onSearch(keywoard: string){
    this.searchKeyword.set(keywoard)
  }



  openModal(){
    this.isModalOpen = true;
  }

  closeModal(){
    this.isModalOpen = false;
    this.roleGroupForm = { roleId: '', namaGroupRole: '' };
  }

  onSubmit(){
    const payload: roleGroupAdd = {
      roleId: Number(this.roleGroupForm.roleId),
      namaGroupRole: this.roleGroupForm.namaGroupRole
    }
    this.rgService.add(payload).pipe(
      tap(() => {
        this.closeModal();
        this.reload.update(v => v + 1);
      }),
      catchError((err) => {
        alert("gagal tambah role group: " + (err?.error ?? err));
        return of(null);
      })
    ).subscribe()
  }


}
