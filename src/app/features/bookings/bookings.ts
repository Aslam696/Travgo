import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TourService } from '../../core/services/tour.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent {
  private readonly tourService = inject(TourService);

  // Read-only dynamic signals from service
  protected readonly bookedTours = this.tourService.bookedTours;
  protected readonly totalBookingPrice = this.tourService.totalBookingPrice;

  // Form handling using local Signals
  protected readonly isCheckoutSuccess = signal<boolean>(false);
  protected readonly travelerName = signal<string>('');
  protected readonly travelerEmail = signal<string>('');

  // Form input setters
  onNameInput(event: Event): void {
    this.travelerName.set((event.target as HTMLInputElement).value);
  }

  onEmailInput(event: Event): void {
    this.travelerEmail.set((event.target as HTMLInputElement).value);
  }

  // Cancel reservation
  cancelBooking(tourId: string): void {
    this.tourService.cancelBooking(tourId);
  }

  // Handle mock checkout
  executeCheckout(event: Event): void {
    event.preventDefault();
    if (this.travelerName().trim() && this.travelerEmail().trim() && this.bookedTours().length > 0) {
      this.isCheckoutSuccess.set(true);
      this.tourService.clearBookings();
    }
  }

  // Reset booking form and state
  restartJourney(): void {
    this.isCheckoutSuccess.set(false);
    this.travelerName.set('');
    this.travelerEmail.set('');
  }
}
