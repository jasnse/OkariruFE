import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-stat-card',
  imports: [],
  templateUrl: './dashboard-stat-card.html',
})
export class DashboardStatCard {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() iconPath = '';
  @Input() accentClass = 'bg-red-50 text-[#b91c1c]';
  @Input() loading = false;
}
