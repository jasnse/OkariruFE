import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardStatCard } from './dashboard-stat-card/dashboard-stat-card';
import { EmployeeService } from '../../service/employee.service';
import { MenuService } from '../../service/menu.service';
import { PinjamanService } from '../../service/pinjaman.service';
import { PinjamanTransactionService } from '../../service/pinjaman-transaction.service';
import { RoleGroupServiceTs } from '../../service/role-group.service';
import { AuthService } from '../../service/auth.service';
import { ICON_OPTIONS } from '../../../shared/icon-options';

interface DashboardStat {
  label: string;
  value: number;
  iconPath: string;
  accentClass: string;
}

interface StatConfig {
  label: string;
  iconPath: string;
  accentClass: string;
  ambilData: () => Observable<number>;
}

const icon = (label: string) => ICON_OPTIONS.find(i => i.label === label)?.path ?? '';

@Component({
  imports: [DashboardStatCard],
  selector: 'app-dasboard',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  private readonly employeeService = inject(EmployeeService);
  private readonly menuService = inject(MenuService);
  private readonly pinjamanService = inject(PinjamanService);
  private readonly pinjamanTransactionService = inject(PinjamanTransactionService);
  private readonly roleGroupService = inject(RoleGroupServiceTs);
  private readonly authService = inject(AuthService);

  readonly username = this.authService.getUsername() ?? 'User';

  loading = signal(true);
  stats = signal<DashboardStat[]>([]);

  // hitung jumlah transaksi pinjaman berdasarkan status
  private countTrxByStatus(status: string): Observable<number> {
    return this.pinjamanTransactionService.getAll(0, 1, '', status).pipe(
      map(res => res.totalElements),
      catchError(() => of(0))
    );
  }

  // config dashboard per role
  private getStatsConfig(role: string | null): StatConfig[] {
    switch (role) {
      case 'MARKETING':
        return [
          { label: 'Pengajuan Baru', iconPath: icon('Review_Pinjaman'), accentClass: 'bg-sky-50 text-sky-600', ambilData: () => this.countTrxByStatus('Pengajuan') },
          { label: 'Sedang Direview', iconPath: icon('Approval_Pinjaman'), accentClass: 'bg-amber-50 text-amber-600', ambilData: () => this.countTrxByStatus('Direview') },
          { label: 'Disetujui', iconPath: icon('Disburse_Pinjaman'), accentClass: 'bg-emerald-50 text-emerald-600', ambilData: () => this.countTrxByStatus('Disetujui') },
          { label: 'Ditolak', iconPath: icon('Review_Pinjaman'), accentClass: 'bg-rose-50 text-rose-600', ambilData: () => this.countTrxByStatus('Ditolak') },
        ];

      case 'BRANCH_MANAGER':
        return [
          { label: 'Menunggu Approval', iconPath: icon('Approval_Pinjaman'), accentClass: 'bg-amber-50 text-amber-600', ambilData: () => this.countTrxByStatus('Direview') },
          { label: 'Disetujui', iconPath: icon('Disburse_Pinjaman'), accentClass: 'bg-emerald-50 text-emerald-600', ambilData: () => this.countTrxByStatus('Disetujui') },
          { label: 'Ditolak', iconPath: icon('Review_Pinjaman'), accentClass: 'bg-rose-50 text-rose-600', ambilData: () => this.countTrxByStatus('Ditolak') },
        ];

      case 'BACKOFFICE':
        return [
          { label: 'Menunggu Pencairan', iconPath: icon('Disburse_Pinjaman'), accentClass: 'bg-sky-50 text-sky-600', ambilData: () => this.countTrxByStatus('Disetujui') },
          { label: 'Total Pinjaman', iconPath: icon('Master_Pinjaman'), accentClass: 'bg-emerald-50 text-emerald-600', ambilData: () => this.pinjamanService.getAll(0, 1).pipe(map(res => res.totalElements), catchError(() => of(0))) },
        ];

      case 'SUPERADMIN':
      default:
        return [
          { label: 'Total Employee', iconPath: icon('Users'), accentClass: 'bg-red-50 text-[#b91c1c]', ambilData: () => this.employeeService.getAll(0, 1).pipe(map(res => res.totalElements), catchError(() => of(0))) },
          { label: 'Total Menu', iconPath: icon('Menu'), accentClass: 'bg-blue-50 text-blue-600', ambilData: () => this.menuService.getAll(0, 1).pipe(map(res => res.totalElements), catchError(() => of(0))) },
          { label: 'Total Role Group', iconPath: icon('Role_group'), accentClass: 'bg-amber-50 text-amber-600', ambilData: () => this.roleGroupService.getAllRg().pipe(map(res => res.length), catchError(() => of(0))) },
          { label: 'Total Pinjaman', iconPath: icon('Master_Pinjaman'), accentClass: 'bg-emerald-50 text-emerald-600', ambilData: () => this.pinjamanService.getAll(0, 1).pipe(map(res => res.totalElements), catchError(() => of(0))) },
        ];
    }
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    const config = this.getStatsConfig(this.authService.getRole());

    this.stats.set(config.map(c => ({ label: c.label, value: 0, iconPath: c.iconPath, accentClass: c.accentClass })));

    let jumlahSelesai = 0;
    const totalRequest = config.length;

    config.forEach((c, i) => {
      c.ambilData().subscribe(value => {
        this.stats.update(current => current.map((stat, idx) => idx === i ? { ...stat, value } : stat));

        jumlahSelesai = jumlahSelesai + 1;
        if (jumlahSelesai === totalRequest) {
          this.loading.set(false);
        }
      });
    });
  }
}
