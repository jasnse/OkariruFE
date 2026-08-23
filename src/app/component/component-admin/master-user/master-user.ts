import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../../../service/employee.service';
import fa from '@angular/common/locales/fa';

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

  ngOnInit(): void {
    this.loadEmployees();
  }

  employeeForm = {
    username: '',
    email: '',
    nip: '',
    password:'',
    joinedDate: '',
    updatedDate: ''
  };

  isModalOpen: boolean = false;

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    this.employeeService.add({
      username: this.employeeForm.username,
      email: this.employeeForm.email,
      password: this.employeeForm.password,
      nip: this.employeeForm.nip
    }).subscribe({
      next: () => {
        this.closeModal(),
        this.loadEmployees()
      },
      error: (err) => {
        alert("tambah employee tidak berhasil: " + err)
      }
    })
  }

  isEditModalOpen: boolean = false;

  onEditEmployee(emp: any): void {
    this.editForm = {
      id: emp.Id,
      email: emp.email || '', // Mengisi email yang ada jika ada
      password: '' // Password dikosongkan demi keamanan
    };
    this.isEditModalOpen = true;
  }

  editForm = {
  id: 0,
  email: '',
  password: ''
  };


  onUpdateEmploye(): void {
    this.employeeService.update( this.editForm.id, {
      email: this.editForm.email,
      password: this.editForm.password
    }).subscribe({
      next: () => {
        this.closeEditModal()
        this.editForm = { id: 0, email: '', password: '' };
        this.loadEmployees()
      }, 
      error: (err) => {
        alert("gagal update employe: " + err)
      }
    })
  }

  isDeleteModal: boolean = false;
  selectedDeleteId: number | null = null;

  modalDelete(emp: any){
    this.isDeleteModal = true;
    this.selectedDeleteId = emp.Id
  }

  closeDeleteModal(){
    this.isDeleteModal = false;
  }

  confirmDelete(): void {
    if(this.selectedDeleteId !== null){
      this.employeeService.delete(this.selectedDeleteId).subscribe({
        next: (res) => {
          console.log('Employee berhasil dihapus', res);
          // this.fetchEmployees(); // Refresh data tabel
          this.closeDeleteModal();
          this.selectedDeleteId = 0;
          this.loadEmployees()
        },
        error: (err) => {
          console.error('Gagal menghapus employee', err);
          this.closeDeleteModal();
          this.selectedDeleteId = 0;
        }
      })
    }
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

  loadEmployees() {
    this.loading.set(true);
    this.employeeService.getAll(this.currentPage(), this.pageSize(), this.searchKeyword()).subscribe({
      next: (res) => {
        this.employees.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  //pagination
  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;   
    this.currentPage.set(page);
    this.loadEmployees();
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
  this.loadEmployees();
}
  setPageSize(size: string){
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.loadEmployees();
  }
}
