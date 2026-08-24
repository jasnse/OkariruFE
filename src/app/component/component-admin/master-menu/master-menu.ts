import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../service/menu.service';
import { menu } from '../../../model/response/menu-response.model';
import { ICON_OPTIONS } from '../../../../environment/icon-options';
import { addMenuRequest } from '../../../model/request/menu-request.model';

@Component({
  imports: [FormsModule],
  selector: 'app-master-menu',
  templateUrl: './master-menu.html',
})


export class MasterMenu {
  iconOptions = ICON_OPTIONS;

  private readonly menuService = inject(MenuService)

  ngOnInit(): void {
    this.loadMenu();
  }

  menu = signal<menu[]>([]);

    menuForm = {
    namaMenu: '',
    deskripsiMenu: '',
    Path: '',
    Icon:''
  };

  private resetForm(): void {
    this.menuForm = {
      namaMenu: '',
      deskripsiMenu: '',
      Path: '',
      Icon:''
    };
  }

  loading = signal(false);
  searchKeyword = signal('')

    // variable pagination
  currentPage = signal(0);   
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);

  //variable Modal
  isModalOpen: boolean = false;

    setPageSize(size: string){
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.loadMenu();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;   
    this.currentPage.set(page);
    this.loadMenu();
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  openModalMenu() {
    this.isModalOpen = true;
  }

  closeModalMenu(){
    this.isModalOpen = false;
    this.resetForm();
  }


  onSearch(keyword: string){
    console.log("lee")
    this.searchKeyword.set(keyword)
    this.currentPage.set(0)
    this.loadMenu()
  }


    loadMenu() {
    this.loading.set(true);
    this.menuService.getAll(this.currentPage(), this.pageSize(), this.searchKeyword()).subscribe({
      next: (res) => {
        this.menu.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSubmit(){
    const payload: addMenuRequest = {
      namaMenu: this.menuForm.namaMenu,
      deskripsiMenu: this.menuForm.deskripsiMenu,
      path: this.menuForm.Path,
      icon: this.menuForm.Icon
    };
    this.menuService.add(payload).subscribe({
      next: () => {
        this.closeModalMenu(),
        this.loadMenu()
      },
      error: (err) => {
        alert("tambah menu tidak berhasil: " + err)
      }
    })
  }

  isDeleteModal: boolean = false;
  selectedDeleteId: number | null = null;

  onDelete(menu: any){
    this.isDeleteModal = true;
    this.selectedDeleteId = menu.menuId;
  }

  closeDeleteModal(){
    this.isDeleteModal = false;
    this.selectedDeleteId = 0;
  }

  confirmDelete(){
    if(this.selectedDeleteId !== null){
      this.menuService.delete(this.selectedDeleteId).subscribe({
        next: (res) => {
          console.log("berhasil hapus", res)
          this.closeDeleteModal();
          this.selectedDeleteId = 0;
          this.currentPage.set(0);
          this.loadMenu()
        },
        error: (err) => {
          alert("gagal Hapus" + err)
          this.selectedDeleteId = 0;
          this.closeDeleteModal()
        }
      })
    }
  }

}
