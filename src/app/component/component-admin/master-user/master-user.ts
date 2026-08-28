import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../service/employee.service';
import { Employee } from '../../../model/response/employee-response.model';
import { AddEmployeeRequest, updateEmpCredential } from '../../../model/request/employee-request.model';
import { PageResponse } from '../../../model/shared/page-response.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

const EMPTY_PAGE: PageResponse<Employee> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };
@Component({
  imports: [FormsModule],
  selector: 'app-master-user',
  templateUrl: './master-user.html',
})
export class MasterUser implements OnInit {

  private readonly employeeService = inject(EmployeeService);

  employees = signal<Employee[]>([]);

  loading = signal(false);
  searchKeyword = signal('')


  // variable pagination
  currentPage = signal(0);   
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);

  employeeForm = {
    username: '',
    email: '',
    nip: '',
    password:'',
    joinedDate: '',
    updatedDate: ''
  };

  isModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isDeleteModal: boolean = false;
  selectedDeleteId: number = 0;

editForm = {
  id: 0,
  email: '',
  password: ''
  };

  private reload = signal(0)

  private params = computed(() => ({
    page: this.currentPage(),
    size: this.pageSize(),
    keyword: this.searchKeyword(),
    _r: this.reload()
  }))

  ngOnInit(): void {
    this.loadEmployees();
  }

  private readonly employePage$ = toObservable(this.params).pipe(
    tap(() => this.loading.set(true)),
    switchMap(p => 
      this.employeeService.getAll(p.page, p.size, p.keyword).pipe(
        catchError((err) => of(EMPTY_PAGE))
      )
    )
  )

  loadEmployees(): void{
    this.employePage$.subscribe(res => {
      this.employees.set(res.content)
      this.totalPages.set(res.totalPages)
      this.totalElements.set(res.totalElements)
      this.loading.set(false)
    })

  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

    onSubmit(): void {
      const payload: AddEmployeeRequest = {
      username: this.employeeForm.username,
      email: this.employeeForm.email,
      password: this.employeeForm.password,
      nip: this.employeeForm.nip
      }
      this.employeeService.add(payload).pipe(
        tap(() => {
          this.closeModal()
          this.reload.update(v => v+1)
        }),
        catchError((err) => {
          alert("tambah employee gagal: " + err)
          return of(null)
        })
      ).subscribe()
    }

  onEditEmployee(emp: any): void {
    this.editForm = {
      id: emp.Id,
      email: emp.email || '',
      password: ''
    };
    this.isEditModalOpen = true;
  }

  onUpdateEmploye(): void {
    const payload: updateEmpCredential = {
      email: this.editForm.email,
      password: this.editForm.password
    }
    this.employeeService.update(this.editForm.id, payload).pipe(
      tap(() => {
        this.closeEditModal();
        this.editForm = { id: 0, email: '', password: '' };
        this.reload.update(v => v+1)
      }),
      catchError((err) => {
        alert("gagal update: "+ err);
        this.closeEditModal();
        return of(null)
      })
    ).subscribe();
  }

  modalDelete(emp: any){
    this.isDeleteModal = true;
    this.selectedDeleteId = emp.Id
  }

  closeDeleteModal(){
    this.isDeleteModal = false;
  }

  confirmDelete(){
    if(this.selectedDeleteId === 0)return;
    this.employeeService.delete(this.selectedDeleteId).pipe(
      tap(() => {
        this.closeDeleteModal();
        this.selectedDeleteId = 0;
        this.currentPage.set(0);
        this.reload.update(v => v+1)
      }),
      catchError((err) => {
        const pesan = err?.error ?? 'Terjadi kesalahan, coba lagi.';
        this.closeDeleteModal();
        alert("Gagal hapus employee: " + pesan);
        this.selectedDeleteId = 0
        return of(null)
      })
    ).subscribe()
  }


  private resetForm(): void {
    this.employeeForm = {
      username: '',
      email: '',
      nip: '',
      password:'',
      joinedDate: '',
      updatedDate: ''
    };
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editForm = { id: 0, email: '', password: '' };
  }

  

  //pagination
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

  onSearch(keyword: string) {
  this.searchKeyword.set(keyword);
  this.currentPage.set(0);   // set halaman jadi 0 kalau search filter
}
  setPageSize(size: string){
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
  }
}
