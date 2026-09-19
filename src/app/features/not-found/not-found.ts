import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  imports: [RouterLink],
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styles: `
    .float {
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .float { animation: none; }
    }
  `,
})
export class NotFound {

  constructor(
     private readonly router: Router,
     private location: Location,
  ) { }


  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/login']);
    }
  }
}
