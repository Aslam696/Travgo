import { Component, inject } from '@angular/core';
import { TourService } from '../../core/services/tour.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  templateUrl: './tours.html',
  styleUrl: './tours.css'
})
export class ToursComponent {
  private readonly tourService = inject(TourService);

  // Expose signals from TourService
  protected readonly filteredTours = this.tourService.filteredTours;
  protected readonly availableTags = this.tourService.availableTags;
  protected readonly activeFilters = this.tourService.filters;

  // Search binding
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tourService.updateFilter({ searchQuery: value });
  }

  // Price range slider binding
  onPriceChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.tourService.updateFilter({ maxPrice: value });
  }

  // Tag selection pill trigger
  selectTag(tag: string): void {
    const currentTag = this.tourService.filters().tag;
    this.tourService.updateFilter({ tag: currentTag === tag ? '' : tag });
  }

  // Reset filter signals
  resetFilters(): void {
    this.tourService.resetFilters();
  }

  // Book Tour
  bookTour(tourId: string): void {
    this.tourService.bookTour(tourId);
  }

  // Check booking state
  isBooked(tourId: string): boolean {
    return this.tourService.bookedTourIds().includes(tourId);
  }
}
