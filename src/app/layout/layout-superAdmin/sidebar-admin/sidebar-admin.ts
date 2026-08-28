import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { MenuService } from '../../../service/menu.service';

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

  menus = this.menuService.myMenu;

  ngOnInit(): void {
    this.menuService.loadMyMenu();
  }

  onClose() {
    this.close.emit();
  }

  goLogout(){
    this.authService.logout()
  }
}
