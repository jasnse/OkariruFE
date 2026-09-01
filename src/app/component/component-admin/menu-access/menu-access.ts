import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { menuAssignedResponse } from '../../../model/response/roleGroup-response.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { MenuService } from '../../../service/menu.service';
import { PageResponse } from '../../../model/shared/page-response.model';
import { menu } from '../../../model/response/menu-response.model';
import { FormsModule } from '@angular/forms';

const EMPTY_MENU_PAGE: PageResponse<menuAssignedResponse> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

@Component({
  imports: [FormsModule],
  selector: 'app-menu-access',
  templateUrl: './menu-access.html',
})
export class MenuAccess implements OnInit {

  private readonly menuService = inject(MenuService)
  
  //value dari component rolegroup detail
  @Input({ required: true }) roleGroupId!: number;

  menuAssign = signal<menuAssignedResponse[]>([])
  menuNonAssign = signal<menu[]>([])

  searchKeyword_menu = signal('');
  currentPage_menu = signal(0);
  pageSize_menu = signal(10);
  totalPages_menu = signal(0);
  totalElements_menu = signal(0);
  private reload = signal(0);

  isMenuAcesss: boolean = false
  isAddMenu: boolean = false
  isDeleteMenu: boolean = false

  selectedGroupId: number = 0
  selectedMenuId: number = 0

  addMenuForm = { menuId: 0 }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages_menu()) return;
    this.currentPage_menu.set(page);
  }

  nextPage() {
    this.goToPage(this.currentPage_menu() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage_menu() - 1);
  }

    setPageSize(size: string){
    this.pageSize_menu.set(Number(size));
    this.currentPage_menu.set(0);
  }

  //menu acess
    private menuParams = computed(() => ({
    page_m: this.currentPage_menu(),
    size_m: this.pageSize_menu(),
    keyword_m : this.searchKeyword_menu(),
    _r:this.reload()
    
  }));

  ngOnInit(){
    this.loadMenuAssigned();
  }

  private readonly menuPage$ = toObservable(this.menuParams).pipe(
    switchMap(p => this.menuService.getMenuGroup(this.roleGroupId, p.page_m, p.size_m, p.keyword_m).pipe(
      catchError(() => of(EMPTY_MENU_PAGE))
    ))
  )

  loadMenuAssigned(){
    this.menuPage$.subscribe(res => {
      this.menuAssign.set(res.content)
      this.totalPages_menu.set(res.totalPages);
      this.totalElements_menu.set(res.totalElements);
    })
  }


  loadMenuNonAssigned(rolegroupId: number){
    this.menuService.getMenusNotInRoleGroup(rolegroupId).subscribe({
      next: (res) => this.menuNonAssign.set(res),
      error: (err) => console.error('Gagal mengambil data menu non assigned:', err)
    })
  }

  goToMenuAcess(){
    this.isMenuAcesss = true
    this.loadMenuAssigned();
  }

  goToMemberList(){
    this.isMenuAcesss = false
  }

  onSearchMenu(keyword_menu: string){
    this.searchKeyword_menu.set(keyword_menu)
    this.currentPage_menu.set(0)
  }

  onAddMenu(roleGroupId: number){
    this.isAddMenu = true
    this.selectedGroupId = roleGroupId
    this.loadMenuNonAssigned(this.roleGroupId);
  }
  
  cancelAddMenu(){
    this.isAddMenu = false
    this.selectedGroupId = 0

  }

  submitAddMenu(){
    if(this.selectedGroupId === 0)return;
    const payload = this.addMenuForm.menuId
    
    this.menuService.addMenuGroup(payload, this.selectedGroupId).pipe(
      tap(() => {
        this.isAddMenu = false
        this.selectedGroupId = 0
        this.reload.update(v => v+1)
        this.menuService.loadMyMenu()
      }),
      catchError((err) => {
        this.isAddMenu = false
        this.selectedGroupId = 0
        alert("gagal tambah menu access: " + (err?.error ?? err) )
        return of(null)
      })
    ).subscribe()
  }

  onDeleteMenu(menuGroupId: number){
    this.isDeleteMenu = true;
    this.selectedMenuId = menuGroupId
  }

  cancelDeleteMenu(){
    this.isDeleteMenu = false;
    this.selectedMenuId = 0
  }


  confirmDeleteMenu(){
    if(this.selectedMenuId === 0)return;
    this.menuService.deleteMenuGroup(this.selectedMenuId).pipe(
      tap(() => {
        this.cancelDeleteMenu()
        this.reload.update(v => v+1)
        this.menuService.loadMyMenu()
      }),
      catchError((err) => {
        this.cancelAddMenu();
        alert("Gagal Hapus Menu" + (err?. error ?? err) )
        return of(null)
      })
    ).subscribe()
  }


}
