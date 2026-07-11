import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
    title: 'Travgo - Epic Travel Adventures'
  },
  {
    path: 'tours',
    loadComponent: () => import('./features/tours/tours').then(m => m.ToursComponent),
    title: 'Travgo - Explore Travel Packages'
  },
  {
    path: 'bookings',
    loadComponent: () => import('./features/bookings/bookings').then(m => m.BookingsComponent),
    title: 'Travgo - My Bookings'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
