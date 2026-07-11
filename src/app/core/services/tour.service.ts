import { Injectable, signal, computed } from '@angular/core';
import { Tour, TourFilters } from '../models/tour.interface';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  // Master database of tours
  private readonly toursList = signal<Tour[]>([
    {
      id: 'kyoto-autumn',
      title: 'Enchanting Kyoto Discovery',
      description: 'Explore the ancient temples, golden pavilions, and mystical bamboo groves of Kyoto in its peak autumn beauty.',
      destination: 'Kyoto, Japan',
      price: 1899,
      duration: '7 Days, 6 Nights',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
      rating: 4.9,
      reviewsCount: 142,
      featured: true,
      tags: ['Culture', 'Scenic', 'Historical']
    },
    {
      id: 'maldives-luxury',
      title: 'Maldives Overwater Retreat',
      description: 'Relax in an exclusive overwater villa surrounded by turquoise waters, vibrant coral reefs, and pristine white sands.',
      destination: 'Male, Maldives',
      price: 3499,
      duration: '5 Days, 4 Nights',
      imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
      rating: 4.95,
      reviewsCount: 98,
      featured: true,
      tags: ['Beach', 'Luxury', 'Relaxation']
    },
    {
      id: 'swiss-alps',
      title: 'Swiss Alps Expedition',
      description: 'An exhilarating trek through majestic alpine peaks, crystal-clear mountain lakes, and charming Swiss chalets.',
      destination: 'Zermatt, Switzerland',
      price: 2299,
      duration: '8 Days, 7 Nights',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
      rating: 4.85,
      reviewsCount: 115,
      featured: true,
      tags: ['Adventure', 'Nature', 'Hiking']
    },
    {
      id: 'serengeti-safari',
      title: 'Serengeti Wildlife Safari',
      description: 'Experience the thrill of seeing the Big Five in their natural habitat during the spectacular annual wildlife migration.',
      destination: 'Serengeti, Tanzania',
      price: 2899,
      duration: '6 Days, 5 Nights',
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop',
      rating: 4.92,
      reviewsCount: 84,
      featured: false,
      tags: ['Wildlife', 'Adventure', 'Nature']
    },
    {
      id: 'amalfi-coast',
      title: 'Amalfi Coast Scenic Cruise',
      description: 'Stroll through cliffside villages, taste lemon-infused local delicacies, and sail across the deep blue Mediterranean Sea.',
      destination: 'Amalfi, Italy',
      price: 2150,
      duration: '7 Days, 6 Nights',
      imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
      rating: 4.78,
      reviewsCount: 160,
      featured: true,
      tags: ['Coastal', 'Food', 'Culture']
    },
    {
      id: 'grand-canyon',
      title: 'Grand Canyon Aerial Thrill',
      description: 'Soar above the massive crimson gorges of the Grand Canyon on a private helicopter, ending with a premium champagne toast.',
      destination: 'Arizona, USA',
      price: 899,
      duration: '2 Days, 1 Night',
      imageUrl: 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?q=80&w=800&auto=format&fit=crop',
      rating: 4.7,
      reviewsCount: 52,
      featured: false,
      tags: ['Adventure', 'Sightseeing', 'Luxury']
    }
  ]);

  // Filtering signals
  readonly filters = signal<TourFilters>({
    searchQuery: '',
    maxPrice: 4000,
    tag: ''
  });

  // State of bookings (array of booked tour IDs)
  readonly bookedTourIds = signal<string[]>([]);

  // Computed: Featured tours
  readonly featuredTours = computed(() => {
    return this.toursList().filter(tour => tour.featured);
  });

  // Computed: Available unique tags from all tours
  readonly availableTags = computed(() => {
    const tags = new Set<string>();
    this.toursList().forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  });

  // Computed: Filters application
  readonly filteredTours = computed(() => {
    const activeFilters = this.filters();
    return this.toursList().filter(tour => {
      const matchesSearch = tour.title.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
                            tour.destination.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
                            tour.description.toLowerCase().includes(activeFilters.searchQuery.toLowerCase());
      
      const matchesPrice = tour.price <= activeFilters.maxPrice;
      const matchesTag = activeFilters.tag === '' || tour.tags.includes(activeFilters.tag);

      return matchesSearch && matchesPrice && matchesTag;
    });
  });

  // Computed: Array of actual tour objects that are currently booked
  readonly bookedTours = computed(() => {
    const ids = this.bookedTourIds();
    return this.toursList().filter(tour => ids.includes(tour.id));
  });

  // Computed: Total price of booked tours
  readonly totalBookingPrice = computed(() => {
    return this.bookedTours().reduce((sum, tour) => sum + tour.price, 0);
  });

  // Update specific filter values
  updateFilter(updates: Partial<TourFilters>): void {
    this.filters.update(prev => ({
      ...prev,
      ...updates
    }));
  }

  // Reset filters
  resetFilters(): void {
    this.filters.set({
      searchQuery: '',
      maxPrice: 4000,
      tag: ''
    });
  }

  // Book a tour (add to bookings list)
  bookTour(tourId: string): void {
    if (!this.bookedTourIds().includes(tourId)) {
      this.bookedTourIds.update(prev => [...prev, tourId]);
    }
  }

  // Cancel booking
  cancelBooking(tourId: string): void {
    this.bookedTourIds.update(prev => prev.filter(id => id !== tourId));
  }

  // Clear all bookings
  clearBookings(): void {
    this.bookedTourIds.set([]);
  }
}
export type { Tour, TourFilters };
