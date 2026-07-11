import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TourService } from '../../core/services/tour.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private readonly tourService = inject(TourService);
  protected readonly featuredTours = this.tourService.featuredTours;

  // Book a tour directly
  bookTour(tourId: string): void {
    this.tourService.bookTour(tourId);
  }

  // Check booking state dynamically
  isBooked(tourId: string): boolean {
    return this.tourService.bookedTourIds().includes(tourId);
  }
}
