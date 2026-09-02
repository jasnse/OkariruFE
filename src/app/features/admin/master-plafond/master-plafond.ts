import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CustomerService } from '../../../core/service/customer.service';
import { PlafondService } from '../../../core/service/plafond.service';
import { customerGet } from '../../../core/model/response/customer-response.model';
import { plafondGet } from '../../../core/model/response/plafond-response.model';
import { plafondUpdate } from '../../../core/model/request/plafond-request.model';
import { PageResponse } from '../../../core/model/shared/page-response.model';

const EMPTY_PAGE: PageResponse<customerGet> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

@Component({
  imports: [FormsModule, DecimalPipe],
  selector: 'app-master-plafond',
  templateUrl: './master-plafond.html',
})
export class MasterPlafond implements OnInit {

  private readonly customerService = inject(CustomerService);
  private readonly plafondService = inject(PlafondService);

  customers = signal<customerGet[]>([]);

  loading = signal(false);
  searchKeyword = signal('');

  currentPage = signal(0);
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);

  // modal informasi plafond
  isPlafondModalOpen = signal(false);
  selectedCustomer = signal<customerGet | null>(null);
  selectedPlafond = signal<plafondGet | null>(null);
  plafondLoading = signal(false);
  plafondNotFound = signal(false);

  // form set/edit plafond
  isEditingPlafond = signal(false);
  submittingPlafond = signal(false);
  plafondForm = { totalPlafond: 0, deskripsiPlafond: '' };

  ngOnInit(): void {
    this.loadCustomers();
  }

  private params = computed(() => ({
    page: this.currentPage(),
    size: this.pageSize(),
    keyword: this.searchKeyword()
  }));

  private readonly customerPage$ = toObservable(this.params).pipe(
    tap(() => this.loading.set(true)),
    switchMap(p =>
      this.customerService.getAll(p.page, p.size, p.keyword).pipe(
        catchError(() => of(EMPTY_PAGE))
      )
    )
  );

  loadCustomers(): void {
    this.customerPage$.subscribe(res => {
      this.customers.set(res.content);
      this.totalPages.set(res.totalPages);
      this.totalElements.set(res.totalElements);
      this.loading.set(false);
    });
  }

  onSearch(keyword: string): void {
    this.searchKeyword.set(keyword);
    this.currentPage.set(0);
  }

  setPageSize(size: string): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  // ===== modal plafond =====

  openPlafond(customer: customerGet): void {
    this.isPlafondModalOpen.set(true);
    this.isEditingPlafond.set(false);
    this.selectedCustomer.set(customer);
    this.selectedPlafond.set(null);
    this.plafondNotFound.set(false);
    this.loadPlafond(customer.customerId);
  }

  private loadPlafond(customerId: number): void {
    this.plafondLoading.set(true);
    this.plafondNotFound.set(false);

    this.plafondService.getByCustomerId(customerId).subscribe({
      next: (res) => {
        this.selectedPlafond.set(res);
        this.plafondLoading.set(false);
      },
      error: () => {
        this.selectedPlafond.set(null);
        this.plafondNotFound.set(true);
        this.plafondLoading.set(false);
      }
    });
  }

  closePlafondModal(): void {
    this.isPlafondModalOpen.set(false);
    this.isEditingPlafond.set(false);
    this.selectedCustomer.set(null);
    this.selectedPlafond.set(null);
  }

  // ===== form set/edit plafond =====

  openPlafondForm(): void {
    const plafond = this.selectedPlafond();
    this.plafondForm = {
      totalPlafond: plafond?.totalPlafond ?? 0,
      deskripsiPlafond: plafond?.deskripsiPlafond ?? ''
    };
    this.isEditingPlafond.set(true);
  }

  cancelPlafondForm(): void {
    this.isEditingPlafond.set(false);
  }

  submitPlafond(): void {
    const customer = this.selectedCustomer();
    const existing = this.selectedPlafond();
    if (!customer || !existing) return;

    this.submittingPlafond.set(true);

    const payload: plafondUpdate = {
      userId: customer.customerId,
      totalPlafond: this.plafondForm.totalPlafond,
      deskripsiPlafond: this.plafondForm.deskripsiPlafond,
      updatedBy: null
    };

    this.plafondService.update(existing.plafondId, payload).subscribe({
      next: () => {
        this.submittingPlafond.set(false);
        this.isEditingPlafond.set(false);
        this.loadPlafond(customer.customerId);
      },
      error: (err) => {
        this.submittingPlafond.set(false);
        alert('Gagal update plafond: ' + (err?.error?.message ?? err));
      }
    });
  }
}
