import { Component, Input } from '@angular/core';

export type StatCardColor = 'red' | 'emerald' | 'amber' | 'sky' | 'violet' | 'gray';

const COLOR_CLASSES: Record<StatCardColor, { wrapper: string; icon: string }> = {
  red: { wrapper: 'bg-red-50', icon: 'text-[#b91c1c]' },
  emerald: { wrapper: 'bg-emerald-50', icon: 'text-emerald-600' },
  amber: { wrapper: 'bg-amber-50', icon: 'text-amber-600' },
  sky: { wrapper: 'bg-sky-50', icon: 'text-sky-600' },
  violet: { wrapper: 'bg-violet-50', icon: 'text-violet-600' },
  gray: { wrapper: 'bg-gray-100', icon: 'text-gray-600' },
};

// Kartu statistik reusable dipakai di semua varian dashboard role.
@Component({
  imports: [],
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
})
export class StatCard {
  @Input() label = '';
  @Input() value: string | number = '-';
  @Input() hint = '';
  @Input() icon = ''; //ambil dari ICON_OPTIONS
  @Input() color: StatCardColor = 'red';

  iconWrapperClass(): string {
    return COLOR_CLASSES[this.color].wrapper;
  }

  iconClass(): string {
    return COLOR_CLASSES[this.color].icon;
  }
}
