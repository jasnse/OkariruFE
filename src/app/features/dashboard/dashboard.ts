import { Component, computed, effect, inject, signal } from '@angular/core';
import { EmployeeService } from '../../core/service/employee.service';
import { MenuService } from '../../core/service/menu.service';
import { PinjamanService } from '../../core/service/pinjaman.service';
import { PinjamanTransactionService } from '../../core/service/pinjaman-transaction.service';
import { RoleGroupServiceTs } from '../../core/service/role-group.service';
import { AuthService } from '../../core/service/auth.service';
import { ICON_OPTIONS } from '../../shared/icon-options';
import { StatCard, StatCardColor } from '../../shared/dashboard/stat-card/stat-card';
import { WelcomeBanner } from '../../shared/dashboard/welcome-banner/welcome-banner';
import { CustomerService } from '../../core/service/customer.service';
import { Chart, ChartDatum } from '../../shared/dashboard/chart/chart';

interface StatCardConfig {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  color: StatCardColor;
}

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  MARKETING: 'Marketing',
  BRANCH_MANAGER: 'Branch Manager',
  BACKOFFICE: 'Back Office',
};

// ambil path svg dari daftar icon yang sudah ada, biar konsisten sama sidebar
function icon(label: string): string {
  return ICON_OPTIONS.find(i => i.label === label)?.path ?? '';
}

@Component({
  imports: [StatCard, WelcomeBanner, Chart],
  selector: 'app-dasboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {

  private readonly employeeService = inject(EmployeeService);
  private readonly pinjamanService = inject(PinjamanService);
  private readonly pinjamanTransactionService = inject(PinjamanTransactionService);
  private readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService)

  readonly username = this.authService.getUsername() ?? 'User';
  readonly role = computed(() => this.authService.getRole() ?? '');
  readonly roleLabel = computed(() => ROLE_LABELS[this.role()] ?? this.role());

  private readonly counts = signal<Record<string, number | string>>({})

  // pengganti ngoninit
  constructor() {
  effect(() => this.loadCounts(this.role()), { allowSignalWrites: true });
}

  readonly stats = computed<StatCardConfig[]>(() => {
    const c = this.counts();
    switch (this.role()) {
      case 'SUPERADMIN':
        return [
          { label: 'Total Employe', value: c['totalUser'] ?? '-', icon: icon('Users'), color: 'red' },
          { label: 'Total Customer', value: c['totalCustomer'] ?? '-', icon: icon('employee_Icon'), color: 'sky' },
          { label: 'Total Produk Pinjaman', value: c['totalPinjaman'] ?? '-', icon: icon('Master_Pinjaman'), color: 'violet' },
          { label: 'Total Transaksi', value: c['totalTransaction'] ?? '-', icon: icon('Disburse_Pinjaman'), color: 'amber' }
        ];
      case 'MARKETING':
        return [
          { label: 'Pengajuan Baru', value: c['countPengajuan'] ?? '-', icon: icon('Review_Pinjaman'), color: 'amber' },
          { label: 'Di Review', value: c['countDireview'] ?? '-', icon: icon('Approval_Pinjaman'), color: 'emerald' },
          { label: 'Di Tolak', value: c['countDitolak'] ?? '-', icon: icon('Rejected'), color: 'red' },
          { label: 'Di Setujui', value: c['countDiApprove'] ?? '-', icon: icon('Approval_Pinjaman'), color: 'sky' },
        ];
      case 'BRANCH_MANAGER':
        return [
          { label: 'Pengajuan Baru', value: c['countPengajuan'] ?? '-', icon: icon('Review_Pinjaman'), color: 'amber' },
          { label: 'Di Review', value: c['countDireview'] ?? '-', icon: icon('Approval_Pinjaman'), color: 'emerald' },
          { label: 'Di Tolak', value: c['countDitolak'] ?? '-', icon: icon('Rejected'), color: 'red' },
          { label: 'Di Setujui', value: c['countDiApprove'] ?? '-', icon: icon('Approval_Pinjaman'), color: 'sky' },
        ];
      case 'BACKOFFICE':
        return [
          { label: 'Pengajuan Baru', value: c['countPengajuan'] ?? '-', icon: icon('Review_Pinjaman'), color: 'amber' },
          { label: 'Di Review', value: c['countDireview'] ?? '-', icon: icon('Approval_Pinjaman'), color: 'emerald' },
          { label: 'Di Tolak', value: c['countDitolak'] ?? '-', icon: icon('Rejected'), color: 'red' },
          { label: 'Di Setujui', value: c['countDiApprove'] ?? '-', icon: icon('Approval_Pinjaman'), color: 'sky' },
        ];
      default:
        return [];
    }
  });


  private loadCounts(role: string): void {
    switch (role) {
      case 'SUPERADMIN':
      this.employeeService.getAll(0, 1).subscribe(res =>
        this.counts.update(c => ({ ...c, totalUser: res.totalElements })));
      this.customerService.getAll(0,1).subscribe(res => 
        this.counts.update(c => ({ ...c, totalCustomer: res.totalElements })))
      this.pinjamanService.getAll(0, 1).subscribe(res =>
        this.counts.update(c => ({ ...c, totalPinjaman: res.totalElements })));
      this.pinjamanTransactionService.getAll(0, 1).subscribe(res =>
        this.counts.update(c => ({ ...c, totalTransaction: res.totalElements })));
      this.loadPipelineCounts();
      this.loadMonthlyTrend();
      break;

      case 'MARKETING':
      case 'BRANCH_MANAGER':
      case 'BACKOFFICE':
        this.loadPipelineCounts();
      break;
    }

  }
  private loadPipelineCounts(): void {
    this.pinjamanTransactionService.getAll(0, 1, '', 'Pengajuan').subscribe(res =>
      this.counts.update(c => ({ ...c, countPengajuan: res.totalElements })));
    this.pinjamanTransactionService.getAll(0, 1, '', 'Direview').subscribe(res =>
      this.counts.update(c => ({ ...c, countDireview: res.totalElements })));
          this.pinjamanTransactionService.getAll(0, 1, '', 'Ditolak').subscribe(res =>
      this.counts.update(c => ({ ...c, countDitolak: res.totalElements })));
    this.pinjamanTransactionService.getAll(0, 1, '', 'Disetujui').subscribe(res =>
      this.counts.update(c => ({ ...c, countDiApprove: res.totalElements })));
  }

  // pie chart: breakdown status — sama buat semua role
  readonly statusPieData = computed<ChartDatum[]>(() => {
    const c = this.counts();
    return [
      { label: 'Pengajuan', value: Number(c['countPengajuan'] ?? 0) },
      { label: 'Direview', value: Number(c['countDireview'] ?? 0) },
      { label: 'Disetujui', value: Number(c['countDiApprove'] ?? 0) },
      { label: 'Ditolak', value: Number(c['countDitolak'] ?? 0) },
    ];
  });

  // bar chart MARKETING/BM/BACKOFFICE
  readonly comparisonBarData = computed<ChartDatum[]>(() => {
    const c = this.counts();
    const diproses = Number(c['countDireview'] ?? 0) + Number(c['countDiApprove'] ?? 0) + Number(c['countDitolak'] ?? 0);
    return [
      { label: 'Pengajuan', value: Number(c['countPengajuan'] ?? 0) },
      { label: 'Sudah Diproses', value: diproses },
    ];
  });

  // line chart SUPERADMIN: jumlah pengajuan per bulan
  readonly monthlyTrend = signal<ChartDatum[]>([]);

  private loadMonthlyTrend(): void {
    this.pinjamanTransactionService.getAll(0, 1000).subscribe(res => {
      const perBulan = new Map<string, number>();
      for (const trx of res.content) {
        const d = new Date(trx.tanggalPengajuan);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        perBulan.set(key, (perBulan.get(key) ?? 0) + 1);
      }
      const sortedKeys = [...perBulan.keys()].sort();
      this.monthlyTrend.set(sortedKeys.map(key => {
        const [year, month] = key.split('-').map(Number);
        const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1));
        return { label, value: perBulan.get(key)! };
      }));
    });
  }

}