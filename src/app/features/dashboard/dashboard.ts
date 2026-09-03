import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmployeeService } from '../../core/service/employee.service';
import { MenuService } from '../../core/service/menu.service';
import { PinjamanService } from '../../core/service/pinjaman.service';
import { PinjamanTransactionService } from '../../core/service/pinjaman-transaction.service';
import { RoleGroupServiceTs } from '../../core/service/role-group.service';
import { AuthService } from '../../core/service/auth.service';
import { ICON_OPTIONS } from '../../shared/icon-options';



@Component({
  imports: [],
  selector: 'app-dasboard',
  templateUrl: './dashboard.html',
})
export class Dashboard   {

  private readonly employeeService = inject(EmployeeService);
  private readonly menuService = inject(MenuService);
  private readonly pinjamanService = inject(PinjamanService);
  private readonly pinjamanTransactionService = inject(PinjamanTransactionService);
  private readonly roleGroupService = inject(RoleGroupServiceTs);
  private readonly authService = inject(AuthService);
  readonly username = this.authService.getUsername() ?? 'User';

  
}
