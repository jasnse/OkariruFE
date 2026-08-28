import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { catchError, of, switchMap, tap, map, finalize } from 'rxjs';
import { RoleGroupServiceTs } from '../../../service/role-group.service';
import { RoleGroupResponse, RoleGroupMemberResponse, rGRoleResponse } from '../../../model/response/roleGroup-response.model';
import { RoleService } from '../../../service/role.service';
import { roleGroupUpdate } from '../../../model/request/roleGroup-request.model';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../../model/response/employee-response.model';
import { PageResponse } from '../../../model/shared/page-response.model';
import { Dashboard } from '../../dashboard/dashboard';
import { stringify } from 'node:querystring';

const EMPTY_MEMBER_PAGE: PageResponse<RoleGroupMemberResponse> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-role-group-detail',
  templateUrl: './role-group-detail.html',
})
export class RoleGroupDetail implements OnInit {
  private readonly rgService = inject(RoleGroupServiceTs);
  private readonly RoleService = inject(RoleService)
  private readonly route = inject(ActivatedRoute);

  private router = inject(Router)

  roleGroupId = Number(this.route.snapshot.paramMap.get('id'));

  roleGroup = signal<RoleGroupResponse | null>(null);
  members = signal<RoleGroupMemberResponse[]>([]);
  isLoading = signal<boolean>(true);

  // employe yang blom punya rolegroup
  employees = signal<Employee[]>([])

  // ini byid
  role = signal<rGRoleResponse | null>(null)

  // ini semuanya
  roles = signal<rGRoleResponse[]>([]);

  // pagination + search member
  searchKeyword = signal('');
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);
  private reload = signal(0);

  isDeleteConfirmation: boolean = false
  isEditModal: boolean = false
  isAddMember: boolean = false
  isRemoveConfirmation: boolean = false

    selectedId: number = 0;

    selectedEmpId: number = 0;

    roleGroupForm = {
    roleId: '',
    namaGroupRole: ''
  };

  addMemberForm = {
    employeeId: 0
  }



  ngOnInit(): void {
    this.loadDetail();
    this.loadRole();
    this.loadMembers();
  }



  loadDetail(){
    this.isLoading.set(true);

    this.rgService.getById(this.roleGroupId).pipe(
      switchMap((roleGroup) =>
        this.rgService.getRoleById(roleGroup.roleId).pipe(
          map(role => ({ roleGroup, role }))
        )
      ),
      tap(({ roleGroup, role }) => {
        this.roleGroup.set(roleGroup);
        this.role.set(role);
      }),
      catchError((err) => {
        console.error('Gagal mengambil data detail role group:', err);
        this.router.navigateByUrl('/master/dashboard')
        return of(null);
      }),
      finalize (() => this.isLoading.set(false)) 
    ).subscribe();
  }

  private memberParams = computed(() => ({
    page: this.currentPage(),
    size: this.pageSize(),
    keyword: this.searchKeyword(),
    _r: this.reload()
  }));

  private readonly memberPage$ = toObservable(this.memberParams).pipe(
    switchMap(p =>
      this.rgService.getMembers(this.roleGroupId, p.page, p.size, p.keyword).pipe(
        catchError(() => of(EMPTY_MEMBER_PAGE))
      )
    )
  );

  loadMembers(): void {
    this.memberPage$.subscribe(res => {
      this.members.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
    });
  }

  onSearch(keyword: string) {
    this.searchKeyword.set(keyword);
    this.currentPage.set(0);
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  loadRole(){
    this.RoleService.getAll(0, 100).subscribe({
      next: (res) => this.roles.set(res.content),
      error: (err) => console.error('Gagal mengambil data role:', err)
    })
  }

  loadEmployeNonRg(){
    this.rgService.getEmployeeNonRg().subscribe({
      next: (res) => this.employees.set(res),
      error: (err) => console.error("gagal memuat data employe: ", (err?.error ?? err) )
    })
  }


  onUpdate(roleGroup_id: number){
    this.isEditModal = true
    this.selectedId = roleGroup_id
  }

  closeUpdate(){
    this.isEditModal = false
    this.selectedId = 0
  }

  confirmUpdate(){
    const payload: roleGroupUpdate = {
      roleId: Number(this.roleGroupForm.roleId),
      namaGroupRole: this.roleGroupForm.namaGroupRole
    };
    this.rgService.updateRg(this.selectedId, payload).pipe(
      tap(() => {
        this.isEditModal = false
        this.selectedId = 0
        this.router.navigate(['/master/role-group']);
        alert("menu berhasil di update")
      }),
      catchError((err) => {
        alert("gagal hapus role group: " + (err?.error ?? err));
        return of(null)
      })
    ).subscribe()
  }

  onDelete(roleGroup_id: number){
    this.isDeleteConfirmation = true
    this.selectedId = roleGroup_id
  }

  closeDelete(){
    this.isDeleteConfirmation = false
    this.selectedId = 0
  }

  confirmDelete(){
    if(this.selectedId === 0)return;
    this.rgService.deleteRg(this.selectedId).pipe(
      tap(() => {
        this.router.navigate(['/master/role-group']);
      }),
      catchError((err) => {
        alert("gagal hapus role group: " + (err?.error ?? err));
        return of(null)
      })
    ).subscribe();
  }

  onAddMember(roleGroup_id: number){
    this.isAddMember = true;
    this.addMemberForm = { employeeId: 0 };
    this.loadEmployeNonRg();
    this.selectedId = roleGroup_id
  }

  cancelAddMember(){
    this.isAddMember = false;
  }

  submitAddMember(){
    if(this.selectedId === 0)return;
    const payload = this.addMemberForm.employeeId
    this.rgService.assignEmployee(this.selectedId, payload).pipe(
      tap(() => {
        this.isAddMember = false
        this.selectedId = 0
        // this.router.navigate(['master/role-group'])
        this.loadMembers();
      }),
      catchError((err) => {
        alert("gagal tambah member role group: " + (err?.error ?? err));
        return of(null)
      })
    ).subscribe()
  }

  onDeleteMember(employeId: number, rolegroupId: number){
    this.isRemoveConfirmation = true
    this.selectedId = rolegroupId
    this.selectedEmpId = employeId
  }

  onCancelDeleteMember(){
    this.isRemoveConfirmation = false
    this.selectedId = 0
    this.selectedEmpId = 0
  }

  confirmDeleteMember(){
    if(this.selectedId === 0 || this.selectedEmpId === 0)return;
    this.rgService.removeEmploye(this.selectedId, this.selectedEmpId).pipe(
      tap(() => {
        this.isRemoveConfirmation = false
        this.selectedId = 0
        this.selectedEmpId = 0
        this.loadMembers();
      }),
      catchError((err) => {
        alert("gagal remove member: " + (err?.error ?? err));
        return of(null)
      })
    ).subscribe()
  }
}
