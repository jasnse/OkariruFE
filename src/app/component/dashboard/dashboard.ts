import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { DashboardStatCard } from './dashboard-stat-card/dashboard-stat-card';
import { DashboardQuickAction } from './dashboard-quick-action/dashboard-quick-action';
import { EmployeeService } from '../../service/employee.service';
import { MenuService } from '../../service/menu.service';
import { PinjamanService } from '../../service/pinjaman.service';
import { RoleGroupServiceTs } from '../../service/role-group.service';
import { AuthService } from '../../service/auth.service';
import { Employee } from '../../model/response/employee-response.model';
import { ICON_OPTIONS } from '../../../shared/icon-options';

interface DashboardStat {
  label: string;
  value: number;
  iconPath: string;
  accentClass: string;
}

interface QuickAction {
  title: string;
  description: string;
  iconPath: string;
  routerLink: string;
}

const icon = (label: string) => ICON_OPTIONS.find(i => i.label === label)?.path ?? '';

@Component({
  imports: [DashboardStatCard, DashboardQuickAction, RouterLink],
  selector: 'app-dasboard',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  private readonly employeeService = inject(EmployeeService);
  private readonly menuService = inject(MenuService);
  private readonly pinjamanService = inject(PinjamanService);
  private readonly roleGroupService = inject(RoleGroupServiceTs);
  private readonly authService = inject(AuthService);

  readonly username = this.authService.getUsername() ?? 'User';

  loading = signal(true);
  recentEmployees = signal<Employee[]>([]);

  stats = signal<DashboardStat[]>([
    { label: 'Total Employee', value: 0, iconPath: icon('Users'), accentClass: 'bg-red-50 text-[#b91c1c]' },
    { label: 'Total Menu', value: 0, iconPath: icon('Menu'), accentClass: 'bg-blue-50 text-blue-600' },
    { label: 'Total Role Group', value: 0, iconPath: icon('Role_group'), accentClass: 'bg-amber-50 text-amber-600' },
    { label: 'Total Pinjaman', value: 0, iconPath: icon('Master_Pinjaman'), accentClass: 'bg-emerald-50 text-emerald-600' },
  ]);

  readonly quickActions: QuickAction[] = [
    { title: 'Master User', description: 'Kelola data employee', iconPath: icon('Users'), routerLink: '/master/master-user' },
    { title: 'Master Menu', description: 'Kelola menu aplikasi', iconPath: icon('Menu'), routerLink: '/master/master-menu' },
    { title: 'Role Group', description: 'Kelola grup role & anggota', iconPath: icon('Role_group'), routerLink: '/master/role-group' },
    { title: 'Master Pinjaman', description: 'Kelola jenis pinjaman', iconPath: icon('Master_Pinjaman'), routerLink: '/master/master-pinjaman' },
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    forkJoin({
      employees: this.employeeService.getAll(0, 5).pipe(catchError(() => of(null))),
      menus: this.menuService.getAll(0, 1).pipe(catchError(() => of(null))),
      roleGroups: this.roleGroupService.getAllRg().pipe(catchError(() => of([]))),
      pinjaman: this.pinjamanService.getAll(0, 1).pipe(catchError(() => of(null))),
    }).subscribe(({ employees, menus, roleGroups, pinjaman }) => {
      this.recentEmployees.set(employees?.content ?? []);

      this.stats.update(current => current.map(stat => {
        switch (stat.label) {
          case 'Total Employee': return { ...stat, value: employees?.totalElements ?? 0 };
          case 'Total Menu': return { ...stat, value: menus?.totalElements ?? 0 };
          case 'Total Role Group': return { ...stat, value: roleGroups?.length ?? 0 };
          case 'Total Pinjaman': return { ...stat, value: pinjaman?.totalElements ?? 0 };
          default: return stat;
        }
      }));

      this.loading.set(false);
    });
  }
}

