import { Component, computed, inject, signal, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TourService } from '../../../core/services/tour.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private readonly tourService = inject(TourService);
  private readonly platformId = inject(PLATFORM_ID);

  // Signals for header interactive states
  protected readonly isScrolled = signal<boolean>(false);
  protected readonly isMenuOpen = signal<boolean>(false);

  // Reactive signal derived from bookings
  protected readonly bookingCount = computed(() => this.tourService.bookedTourIds().length);

  // HostListener for window scroll events to toggle transparency
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 50);
    }
  }

  // Toggle mobile navigation menu
  toggleMenu(): void {
    this.isMenuOpen.update(state => !state);
  }

  // Close menu on link click
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
