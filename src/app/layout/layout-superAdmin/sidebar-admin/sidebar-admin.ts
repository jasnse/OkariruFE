import { Component, EventEmitter, Input, OnInit, Output, computed, inject, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { MenuService } from '../../../service/menu.service';

import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// keyword yang menandakan sebuah menu termasuk kategori "Loan Operations"
// (menu master data seperti "Master Pinjaman" tetap masuk section "Menu" karena path-nya diawali "master-")
const LOAN_KEYWORDS = ['pinjaman', 'pengajuan'];

@Component({
  selector: 'app-sidebar-superadmin',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-admin.html',
  // styleUrl: './sidebar-superadmin.css',
})
export class SidebarSuperadmin implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  menus = this.menuService.myMenu;

  // untuk menu loan
  loanMenus = computed(() => this.menus().filter(m => this.isLoanMenu(m.namaMenu, m.path)));

  // untuk menu lain selain loan
  generalMenus = computed(() => this.menus().filter(m => !this.isLoanMenu(m.namaMenu, m.path)));


  // fuction pemisah kategori
  private isLoanMenu(namaMenu: string, path: string): boolean {
    const lastSegment = path.split('/').filter(Boolean).pop()?.toLowerCase() ?? '';
    if (lastSegment.startsWith('master-')) return false;

    const text = `${namaMenu} ${path}`.toLowerCase();
    return LOAN_KEYWORDS.some(keyword => text.includes(keyword));
  }

  ngOnInit(): void {
    this.menuService.loadMyMenu();

    this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(() => this.menuService.loadMyMenu());
  }

  onClose() {
    this.close.emit();
  }

  goLogout(){
    this.authService.logout()
  }
}
