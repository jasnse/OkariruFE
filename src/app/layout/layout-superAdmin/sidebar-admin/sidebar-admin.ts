import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { MenuService } from '../../../service/menu.service';
import { MenuItem } from '../../../model/response/menu-response.model';

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
  private readonly menuService = inject(MenuService);

  menus = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.menuService.getMyMenu().subscribe({
      next: (res) => this.menus.set(res)
    });
  }

  onClose() {
    this.close.emit();
  }

  goLogout(){
    this.authService.logout()
  }
}
