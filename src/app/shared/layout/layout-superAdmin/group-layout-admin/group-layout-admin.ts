import { Component, signal } from '@angular/core';
import { SidebarSuperadmin } from "../sidebar-admin/sidebar-admin";
import { NavbarSuperadmin } from "../navbar-admin/navbar-admin";
import { RouterOutlet } from "@angular/router";

@Component({
  imports: [SidebarSuperadmin, NavbarSuperadmin, RouterOutlet],
  selector: 'app-group-layout-admin',
  templateUrl: './group-layout-admin.html',
})
export class GroupLayoutAdmin {
  sidebarOpen = signal(false);

toggleSidebar() {
  this.sidebarOpen.set(!this.sidebarOpen());
}

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
