import { Component, EventEmitter, Output, afterNextRender, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-navbar-superadmin',
  imports: [],
  templateUrl: './navbar-admin.html'
})
export class NavbarSuperadmin {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly username = this.authService.getUsername() ?? 'User';
  readonly role = this.authService.getRole() ?? '-';
  readonly userName = this.computeInitials(this.username);
  readonly titleNavbar = signal('Dashboard');

  constructor(){
    //wait till render
    afterNextRender(() => this.updateTitle());

    //refresh 
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => this.updateTitle());
  }

  private updateTitle() {
    this.titleNavbar.set(this.getCurrentTitle());
  }

  private getCurrentTitle(): string {
    //get route file and data with key title
    let route = this.activatedRoute.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot?.data?.['title'] ?? 'Dashboard';
  }

  
  // initial untuk foto di profile picture nya
  private computeInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return letters.toUpperCase();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
