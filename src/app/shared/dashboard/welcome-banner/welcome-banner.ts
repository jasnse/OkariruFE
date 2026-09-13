import { Component, Input } from '@angular/core';

// Header sapaan reusable di puncak dashboard, sama buat semua role.
@Component({
  imports: [],
  selector: 'app-welcome-banner',
  templateUrl: './welcome-banner.html',
})
export class WelcomeBanner {
  @Input() username = 'User';
  @Input() roleLabel = '';

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat pagi,';
    if (hour < 15) return 'Selamat siang,';
    if (hour < 18) return 'Selamat sore,';
    return 'Selamat malam,';
  }
}
