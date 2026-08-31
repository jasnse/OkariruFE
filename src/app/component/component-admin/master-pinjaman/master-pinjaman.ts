import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { pinjamanGet } from '../../../model/response/pinjaman-response.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { PinjamanService } from '../../../service/pinjaman.service';
import { PageResponse } from '../../../model/shared/page-response.model';
import { FormsModule } from '@angular/forms';
import { pinjamanRequest } from '../../../model/request/pinjaman-request.model';

const EMPTY_PAGE: PageResponse<pinjamanGet> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

@Component({
  imports: [FormsModule],
  selector: 'app-master-pinjaman',
  templateUrl: './master-pinjaman.html',
})
export class MasterPinjaman implements OnInit{

  private readonly pinjamanService = inject(PinjamanService)

  pinjamanList = signal<pinjamanGet[]>([]);

  currentPage = signal(0);
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);
  loading = signal(false);
  searchKeyword = signal('')

  private reload = signal(0);

  isAddOpen: boolean = false;
  isEditOpen: boolean = false;
  isDeleteOpen: boolean = false;

  selectedPinjamanId = 0;
  
  addForm = {
    jenisPinjaman: "",
    deskripsiPinjaman: "",
    bunga: 0,
    biayaLainnya: 0,
  }

  resetform(){
    jenisPinjaman: "";
    deskripsiPinjaman: "";
    bunga: 0;
    biayaLainnya: 0;
  }

  ngOnInit(){
    this.loadPinjaman();
  }

    private pinjamanParams = computed(() => ({
    page: this.currentPage(),
    size: this.pageSize(),
    keyword: this.searchKeyword(),
    _r: this.reload()
  }));

  private readonly pinjamanPage$ = toObservable(this.pinjamanParams).pipe(
    tap(() => this.loading.set(true)),
    switchMap(p =>
      this.pinjamanService.getAll(p.page, p.size, p.keyword).pipe(
        catchError(() => of(EMPTY_PAGE))
      )
    )
  );

  loadPinjaman(): void {
    this.pinjamanPage$.subscribe(res => {
      this.pinjamanList.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
      this.loading.set(false);
    });

  }

    onSearch(keyword: string){
    this.searchKeyword.set(keyword)
  }

  openAddPinjaman(){
    this.isAddOpen = true;
  }

  cancelAddPinjaman(){
    this.isAddOpen = false;
    this.resetform();
  }

  addPinjaman(){
    const payload: pinjamanRequest ={
      jenisPinjaman: this.addForm.jenisPinjaman,
      deskripsiPinjaman: this.addForm.deskripsiPinjaman,
      bunga: this.addForm.bunga,
      biayaLainnya: this.addForm.biayaLainnya
    };
    this.pinjamanService.addPinjaman(payload).pipe(
      tap(() => {
        this.cancelAddPinjaman();
        this.reload.update(v => v + 1 )
      }),
      catchError((err) => {
        this.cancelAddPinjaman();
        alert("gagal Tambah Pinjaman" + (err?.error ?? err))
        return of(null)
      })
    ).subscribe()
  }

  onEditPinjaman(pinjamanId: number){
    this.isEditOpen = true;
    this.selectedPinjamanId = pinjamanId
  }

  submitEditPinjaman(){
    if(this.selectedPinjamanId === 0)return;
    const payload: pinjamanRequest = {
      jenisPinjaman: this.addForm.jenisPinjaman,
      deskripsiPinjaman: this.addForm.deskripsiPinjaman,
      bunga: this.addForm.bunga,
      biayaLainnya: this.addForm.biayaLainnya
    };
    this.pinjamanService.editPinjman(payload, this.selectedPinjamanId).pipe(
      tap(() => {
        this.cancelEditPinjaman();
        this.reload.update(v => v+1)
      }),
      catchError((err) => {
        this.cancelEditPinjaman()
        alert("Gagal Edit Pinjaman" + (err?.error ?? err))
        return of(null)
      })
    ).subscribe()
  }

  cancelEditPinjaman(){
    this.isEditOpen = false;
    this.selectedPinjamanId = 0;
    this.resetform()
  }

  onDeletePinjaman(pinjamanId: number){
    this.isDeleteOpen = true;
    this.selectedPinjamanId = pinjamanId;
  }

  cancelDeletePinjaman(){
    this.isDeleteOpen = false;
    this.selectedPinjamanId = 0;
  }

  confirmDeletePinjaman(){
    if(this.selectedPinjamanId === 0)return;

    this.pinjamanService.deletePinjaman(this.selectedPinjamanId).pipe(
      tap(() => {
        this.cancelDeletePinjaman()
        this.reload.update(g => g+1)
      }),
      catchError((err) => {
        this.cancelDeletePinjaman()
        alert("Gagal Delete Pinjaman"+ (err?.error ?? err))
        return of(null)
      })
    ).subscribe()
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
}
