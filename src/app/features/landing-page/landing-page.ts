import { afterNextRender, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

const BUNGA_PER_BULAN = 0.015; // 1.5% flat / bulan, asumsi ilustrasi

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
})
export class LandingPage {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const elements = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.reveal');

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
      );

      elements.forEach((el) => observer.observe(el));
    });
  }

  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  tenorOptions = [6, 12, 18, 24, 36];

  jumlahPinjaman = signal(20000000);
  tenor = signal(12);

  totalBunga = computed(() => this.jumlahPinjaman() * BUNGA_PER_BULAN * this.tenor());
  totalPembayaran = computed(() => this.jumlahPinjaman() + this.totalBunga());
  angsuranPerBulan = computed(() => this.totalPembayaran() / this.tenor());

  minPinjaman = 1000000;
  maxPinjaman = 200000000;
  stepPinjaman = 500000;

  setTenor(bulan: number) {
    this.tenor.set(bulan);
  }

  onSliderInput(value: string) {
    this.jumlahPinjaman.set(Number(value));
  }

  formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  }
}
