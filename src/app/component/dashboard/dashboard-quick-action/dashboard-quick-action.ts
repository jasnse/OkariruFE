import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-quick-action',
  imports: [RouterLink],
  templateUrl: './dashboard-quick-action.html',
})
export class DashboardQuickAction {
  @Input() title = '';
  @Input() description = '';
  @Input() iconPath = '';
  @Input() routerLink: string | any[] = '';
}
