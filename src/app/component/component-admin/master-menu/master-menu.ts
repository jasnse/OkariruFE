import { Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../service/menu.service';
import { menu } from '../../../model/response/menu-response.model';
import { ICON_OPTIONS } from '../../../../shared/icon-options';
import { addMenuRequest, updateMenu } from '../../../model/request/menu-request.model';
import { catchError, of, switchMap, tap } from 'rxjs';
import { PageResponse } from '../../../model/shared/page-response.model';

const EMPTY_PAGE: PageResponse<menu> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

@Component({
  imports: [FormsModule],
  selector: 'app-master-menu',
  templateUrl: './master-menu.html',
})

export class MasterMenu {
  iconOptions = ICON_OPTIONS;
  private readonly menuService = inject(MenuService)

  isEditMenuModal: boolean = false
  menu = signal<menu[]>([]);

  editMenuForm = {
    Id: 0,
    namaMenu: '',
    deskripsiMenu: '',
    Path: '',
    Icon: '',
  }

  menuForm = {
    namaMenu: '',
    deskripsiMenu: '',
    Path: '',
    Icon:''
  };

  loading = signal(false);
  searchKeyword = signal('')

  currentPage = signal(0);
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);

  isModalOpen: boolean = false;

  private reload = signal(0);

  isDeleteModal: boolean = false;
  selectedDeleteId: number | null = null;

  private params = computed(() => ({
    page: this.currentPage(),
    size: this.pageSize(),
    keyword: this.searchKeyword(),
    _r: this.reload()
  }));



  ngOnInit(): void {
    this.loadMenu();
  }

    private readonly menuPage$ = toObservable(this.params).pipe(
    tap(() => this.loading.set(true)),
    switchMap(p =>
      this.menuService.getAll(p.page, p.size, p.keyword).pipe(
        catchError(() => of(EMPTY_PAGE))
      )
    )
  );

    loadMenu(): void {
    this.menuPage$.subscribe(res => {
      this.menu.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
      this.loading.set(false);
    });
  }

  private resetForm(): void {
    this.menuForm = {
      namaMenu: '',
      deskripsiMenu: '',
      Path: '',
      Icon:''
    };
  }

    setPageSize(size: string){
    this.pageSize.set(Number(size));
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

  openModalMenu() {
    this.isModalOpen = true;
  }

  closeModalMenu(){
    this.isModalOpen = false;
    this.resetForm();
  }


  onSearch(keyword: string){
    this.searchKeyword.set(keyword)
    this.currentPage.set(0)
  }



  onSubmit(){
    const payload: addMenuRequest = {
      namaMenu: this.menuForm.namaMenu,
      deskripsiMenu: this.menuForm.deskripsiMenu,
      path: this.menuForm.Path,
      icon: this.menuForm.Icon
    };
    this.menuService.add(payload)
    .pipe(
      tap(() => {
        this.closeModalMenu(),
        this.reload.update(v => v + 1)
        this.menuService.loadMyMenu();
      }),
      catchError((err) => {
 alert("tambah menu tidak berhasil: " + err)
 return of(null);
      })
    )
    .subscribe()
  }


  onDelete(menu: any){
    this.isDeleteModal = true;
    this.selectedDeleteId = menu.menuId;
  }

  closeDeleteModal(){
    this.isDeleteModal = false;
    this.selectedDeleteId = 0;
  }

confirmDelete(){
    if (this.selectedDeleteId === null) return;

    this.menuService.delete(this.selectedDeleteId)
    .pipe(
        tap(() => {
            this.closeDeleteModal();
            this.selectedDeleteId = 0;
            this.currentPage.set(0);
            this.reload.update(v => v + 1);
            this.menuService.loadMyMenu();
        }),
        catchError((err) => {
            alert("gagal Hapus" + err);
            this.selectedDeleteId = 0;
            this.closeDeleteModal();
            return of(null);
        })
    )
    .subscribe();
}



  onEditMenu(menuUpdate: any): void{
    this.editMenuForm = {
    Id: menuUpdate.menuId,
    namaMenu: menuUpdate.namaMenu,
    deskripsiMenu: menuUpdate.deskripsiMenu,
    Path: menuUpdate.path,
    Icon:''
    }
    this.isEditMenuModal = true;
  }

  closeEditMenu(){
    this.isEditMenuModal = false;
  }

submitEdit(): void{
    const payload: updateMenu = {
        namaMenu: this.editMenuForm.namaMenu,
        deskripsiMenu: this.editMenuForm.deskripsiMenu,
        path: this.editMenuForm.Path,
        icon: this.editMenuForm.Icon
    };

    this.menuService.update(this.editMenuForm.Id, payload)
    .pipe(
        tap(() => {
            this.closeEditMenu();
            this.editMenuForm = { Id: 0, namaMenu: '', deskripsiMenu: '', Path: '', Icon: '' };
            this.reload.update(v => v + 1);
            this.menuService.loadMyMenu();
        }),
        catchError((err) => {
            alert("gagal update" + err);
            return of(null);
        })
    )
    .subscribe();
}

}
  
