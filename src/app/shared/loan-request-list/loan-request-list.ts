import { Component, Input, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PinjamanTransactionService } from '../../core/service/pinjaman-transaction.service';
import { CustomerService } from '../../core/service/customer.service';
import { PinjamanService } from '../../core/service/pinjaman.service';
import { DocumentService } from '../../core/service/document.service';
import { pinjamanTrxGet } from '../../core/model/response/pinjamanTrx-response.model';
import { customerGet } from '../../core/model/response/customer-response.model';
import { pinjamanGet } from '../../core/model/response/pinjaman-response.model';
import { documentGet } from '../../core/model/response/document-response.model';
import { pinjamanTransactionUpdate } from '../../core/model/request/pinjamanTrx-request.model';
import { PageResponse } from '../../core/model/shared/page-response.model';
import { AngsuranService } from '../../core/service/angsuran.service';

const EMPTY_PAGE: PageResponse<pinjamanTrxGet> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

type DetailTab = 'customer' | 'pinjaman' | 'perhitungan' | 'dokumen' | 'submit';

export type LoanStage = 'review' | 'approval' | 'pencairan';

interface DocumentPreview {
  url: string;
  isImage: boolean;
}

@Component({
  imports: [NgClass, DecimalPipe, FormsModule],
  selector: 'app-loan-request-list',
  templateUrl: './loan-request-list.html',
})
export class LoanRequestList implements OnInit, OnDestroy {

  // stage menentukan: status apa yang di-fetch ke list, dan tombol aksi apa yang muncul di tab terakhir modal.
  @Input() stage: LoanStage = 'review';
  @Input() statusFilter = 'Pengajuan';

  private readonly pinjamanTransactionService = inject(PinjamanTransactionService)
  private readonly customerService = inject(CustomerService)
  private readonly pinjamanService = inject(PinjamanService)
  private readonly documentService = inject(DocumentService)
  private readonly angsuranService = inject(AngsuranService)

  pengajuanList = signal<pinjamanTrxGet[]>([]);

  currentPage = signal(0);
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);
  loading = signal(false);
  searchKeyword = signal('');

  private reload = signal(0);

  // detail modal
  isDetailOpen = signal(false);
  activeTab = signal<DetailTab>('customer');
  selectedTrx = signal<pinjamanTrxGet | null>(null);
  selectedCustomer = signal<customerGet | null>(null);
  selectedPinjaman = signal<pinjamanGet | null>(null);
  documents = signal<documentGet[]>([]);
  documentPreviews = signal<Record<number, DocumentPreview>>({});
  detailLoading = signal(false);
  submitting = signal(false);

  noteForm = { note: '' };

  getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'disetujui':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'direview':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ditolak':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'pengajuan':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

  ngOnInit(){
    this.loadPengajuan();
  }

    private pengajuanParams = computed(() => ({
    page: this.currentPage(),
    size: this.pageSize(),
    keyword: this.searchKeyword(),
    _r: this.reload()
  }));

  private readonly pengajuanPage$ = toObservable(this.pengajuanParams).pipe(
    tap(() => this.loading.set(true)),
    switchMap(p =>
      this.pinjamanTransactionService.getAll(p.page, p.size, p.keyword, this.statusFilter).pipe(
        catchError(() => of(EMPTY_PAGE))
      )
    )
  );

  loadPengajuan(): void {
    this.pengajuanPage$.subscribe(res => {
      this.pengajuanList.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
      this.loading.set(false);
    });
  }

  // ===== perhitungan pinjaman =====

  // hitungJumlahBunga(): number {
  //   const nominal = this.selectedTrx()?.nominalPinjaman ?? 0;
  //   const bungaRate = this.selectedPinjaman()?.bunga ?? 0;
  //   return nominal * (bungaRate / 100);
  // }
  hitungJumlahBungaSampaiLunas(): number {
  const nominal = this.selectedTrx()?.nominalPinjaman ?? 0;
  const tenor = this.selectedTrx()?.tenor ?? 0;
  const bungaRate = this.selectedPinjaman()?.bunga ?? 0;
  const bungaPerBulan = (nominal * (bungaRate / 100));
  const result = bungaPerBulan * tenor;
  console.log(`hitungJumlahBungaSampaiLunas: nominal=${nominal}, tenor=${tenor}, bungaRate=${bungaRate}, bungaPerBulan=${bungaPerBulan}, result=${result}`);
  return result;

}

  hitungJumlahBungaPerBulan(): number {
  const nominal = this.selectedTrx()?.nominalPinjaman ?? 0;
  const bungaRate = this.selectedPinjaman()?.bunga ?? 0;
  const bungaPerBulan = (nominal * (bungaRate / 100));
  return bungaPerBulan;
}

  hitungTotalHutang(): number {
    const angsuranPerBulan = this.hitungTotalAngsuran();
    const tenor = this.selectedTrx()?.tenor ?? 0;
    // biaya lainnya sudah dicicil merata di hitungTotalAngsuran(), tidak perlu ditambah lagi di sini
    return angsuranPerBulan * tenor;
  }

  hitungTotalAngsuran(): number {
  const nominal = this.selectedTrx()?.nominalPinjaman ?? 0;
  const tenor = this.selectedTrx()?.tenor ?? 0;
  if (!tenor) return 0;
  const pokokPerBulan = Math.floor(nominal / tenor);
  const bungaRate = this.selectedPinjaman()?.bunga ?? 0;
  const bungaPerBulan = Math.floor(nominal * (bungaRate / 100));
  const biayaLainnya = this.selectedPinjaman()?.biayaLainnya ?? 0;
  const biayaLainnyaPerBulan = Math.floor(biayaLainnya / tenor);
  return pokokPerBulan + bungaPerBulan + biayaLainnyaPerBulan;
}

  onSearch(keyword: string){
    this.searchKeyword.set(keyword);
    this.currentPage.set(0);
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

  // ===== detail modal =====

  onDetail(trx: pinjamanTrxGet){
    this.isDetailOpen.set(true);
    this.activeTab.set('customer');
    this.selectedTrx.set(trx);
    this.selectedCustomer.set(null);
    this.selectedPinjaman.set(null);
    this.documents.set([]);
    this.clearDocumentPreviews();
    this.noteForm = { note: '' };
    this.detailLoading.set(true);

    this.customerService.getById(trx.customerId).subscribe({
      next: (res) => this.selectedCustomer.set(res),
      error: () => this.selectedCustomer.set(null)
    });

    if (trx.pinjamanId != null) {
      this.pinjamanService.getById(trx.pinjamanId).subscribe({
        next: (res) => this.selectedPinjaman.set(res),
        error: () => this.selectedPinjaman.set(null)
      });
    }

    this.documentService.getByCustomerAndTrx(trx.customerId, trx.transPinjamanId).subscribe({
      next: (res) => {
        this.documents.set(res);
        this.detailLoading.set(false);
        res.forEach(doc => this.loadDocumentPreview(doc));
      },
      error: () => this.detailLoading.set(false)
    });
  }


  private loadDocumentPreview(doc: documentGet){
    this.documentService.getFileBlob(doc.pathfile).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.documentPreviews.update(m => ({ ...m, [doc.dokumenId]: { url, isImage: blob.type.startsWith('image/') } }));
      },
      error: () => {}
    });
  } 

  private clearDocumentPreviews(){
    Object.values(this.documentPreviews()).forEach(p => URL.revokeObjectURL(p.url));
    this.documentPreviews.set({});
  }

  closeDetail(){
    this.isDetailOpen.set(false);
    this.selectedTrx.set(null);
    this.clearDocumentPreviews();
  }

  ngOnDestroy(){
    this.clearDocumentPreviews();
  }

  setTab(tab: DetailTab){
    this.activeTab.set(tab);
  }

  // payload dasar yang dipakai semua stage
  private basePayload(trx: pinjamanTrxGet): pinjamanTransactionUpdate {
    return {
      customerId: trx.customerId,
      pinjamanId: trx.pinjamanId,
      nominalPinjaman: trx.nominalPinjaman,
      tenor: trx.tenor,
      statusPengajuan: trx.statusPengajuan,
      tanggalReview: trx.tanggalReview,
      tanggalApproval: trx.tanggalApproval,
      noteMarketing: trx.noteMarketing,
      noteBm: trx.noteBm,
      noteBackOffice: trx.noteBackOffice,
      lastUpdateBy: null
    };
  }

  private submitUpdate(payload: pinjamanTransactionUpdate, trx: pinjamanTrxGet, errorLabel: string){
    this.submitting.set(true);
    this.pinjamanTransactionService.update(trx.transPinjamanId, payload).pipe(
      tap(() => {
        this.submitting.set(false);
        this.closeDetail();
        this.reload.update(v => v + 1);
      }),
      catchError((err) => {
        this.submitting.set(false);
        const message = typeof err?.error === 'string'
          ? err.error
          : (err?.error?.message ?? err?.message ?? 'Terjadi kesalahan tidak diketahui');
        alert(`Gagal ${errorLabel}: ${message}`);
        return of(null);
      })
    ).subscribe();
  }

  // stage: review — Pengajuan -> Direview (Marketing)
  submitReview(){
    const trx = this.selectedTrx();
    if (!trx) return;

    const payload = this.basePayload(trx);
    payload.statusPengajuan = 'Direview';
    payload.tanggalReview = new Date().toISOString().slice(0, 10);
    payload.noteMarketing = this.noteForm.note;

    this.submitUpdate(payload, trx, 'submit review');
  }

  // stage: approval - BM
  approveTrx(){
    const trx = this.selectedTrx();
    if (!trx) return;

    const payload = this.basePayload(trx);
    payload.statusPengajuan = 'Disetujui';
    payload.tanggalApproval = new Date().toISOString().slice(0, 10);
    payload.noteBm = this.noteForm.note;

    this.submitUpdate(payload, trx, 'approve pengajuan');
  }

  // oleh BM
  rejectTrx(){
    const trx = this.selectedTrx();
    if (!trx) return;

    const payload = this.basePayload(trx);
    payload.statusPengajuan = 'Ditolak';
    payload.tanggalApproval = new Date().toISOString().slice(0, 10);
    payload.noteBm = this.noteForm.note;

    this.submitUpdate(payload, trx, 'reject pengajuan');
  }

  cairkanPinjaman(){
    const trx = this.selectedTrx();
    if (!trx || trx.tenor == null) return;

this.submitting.set(true);

  this.angsuranService.generate(trx.transPinjamanId, trx.tenor).pipe(
    switchMap(() => {
      const payload = this.basePayload(trx);
      payload.statusPengajuan = 'Dicairkan';
      payload.tanggalApproval = new Date().toISOString().slice(0, 10);
      payload.noteBackOffice = this.noteForm.note;
      return this.pinjamanTransactionService.update(trx.transPinjamanId, payload);
    }),
    tap(() => {
      this.submitting.set(false);
      this.closeDetail();
      this.reload.update(v => v + 1);
    }),
    catchError((err) => {
      this.submitting.set(false);
      alert('Gagal cairkan pinjaman: ' + (err?.error?.message ?? err));
      return of(null);
    })
  ).subscribe();
  }
}
