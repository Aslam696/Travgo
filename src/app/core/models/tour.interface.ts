export interface Tour {
  id: string;
  title: string;
  description: string;
  destination: string;
  price: number;
  duration: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  tags: string[];
}

export interface TourFilters {
  searchQuery: string;
  maxPrice: number;
  tag: string;
}
