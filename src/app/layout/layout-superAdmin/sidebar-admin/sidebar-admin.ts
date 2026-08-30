import { Component, EventEmitter, Input, OnInit, Output, inject, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { MenuService } from '../../../service/menu.service';

import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
