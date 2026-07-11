# Travgo - Architecture & Folder Structure Guide

This document describes the folder structure, coding guidelines, performance optimizations, and design system for the **Travgo** travel agency web application. This project uses **Angular 21** with a strict focus on reactive signals, standalone components, deferrable views, and optimal performance.

---

## 1. Directory Structure

To ensure future scale and stability, the workspace is organized into three primary layers: `core`, `shared`, and `features`. Each component uses a strict **3-layer layout** containing separate `.ts` (logic), `.html` (template), and `.css` (styling) files.

```text
src/
├── app/
│   ├── core/                      # Global, singleton code
│   │   ├── guards/                # Route guards
│   │   ├── interceptors/          # HTTP interceptors
│   │   ├── models/                # Interfaces & types definition
│   │   └── services/              # Global state & API services (e.g., TourService)
│   │
│   ├── shared/                    # Reusable components & utilities
│   │   ├── components/            # UI components (Buttons, Input, Card skeletons)
│   │   ├── directives/            # Reusable directives
│   │   └── pipes/                 # Custom pipes
│   │
│   ├── features/                  # Lazy-loaded feature domains
│   │   ├── layout/                # Global layout elements (Header, Footer, Sidebar)
│   │   │   ├── header/            # header.ts, header.html, header.css
│   │   │   └── footer/            # footer.ts, footer.html, footer.css
│   │   ├── home/                  # Home / Landing Page (home.ts, home.html, home.css)
│   │   ├── tours/                 # Tours catalog & filters (tours.ts, tours.html, tours.css)
│   │   └── bookings/              # Booking summary / Checkout (bookings.ts, bookings.html, bookings.css)
│   │
│   ├── app.config.server.ts       # SSR configuration
│   ├── app.config.ts              # Core providers, hydration, and routing setup
│   ├── app.routes.ts              # Route declarations with lazy loading
│   ├── app.ts                     # Main shell Component (TS)
│   ├── app.html                   # Main shell Template (HTML)
│   └── app.css                    # Main shell Styles (CSS)
│
├── index.html                     # HTML Entry point
├── main.server.ts                 # SSR server bootstrap
├── main.ts                        # Client bootstrap
└── styles.css                     # Global design tokens, resets & helper classes
```

---

## 2. Modern Angular 21 Standards

### 2.1 Angular Signals
All dynamic state management must use Signals instead of RxJS observables where appropriate. This guarantees granular reactivity, higher performance, and no memory leaks.
* **Component State**: Define states using `signal()`.
* **Computed Values**: Derivations must use `computed()`.
* **Side Effects**: Perform logs, local storage syncs, or non-data-flow side effects inside `effect()`.
* **Inputs & Outputs**: Use signal-based input APIs:
  ```typescript
  // Modern signal inputs, outputs & model binding
  title = input<string>(); // read-only input
  count = model<number>(0); // two-way bindable signal input
  clicked = output<void>(); // modern event output
  ```

### 2.2 Standalone Components
All components, directives, and pipes must be standalone:
* Use the `@Component({ standalone: true, imports: [...] })` decorator.
* Specify templates and styles with `templateUrl` and `styleUrl` pointing to separate files.

### 2.3 Built-in Control Flow
Never import or use `NgIf`, `NgFor`, or `NgSwitch`. Use the native Angular control flow:
```html
@if (tours().length > 0) {
  <div class="tour-grid">
    @for (tour of tours(); track tour.id) {
      <app-tour-card [tour]="tour" />
    }
  </div>
} @else {
  <p>No tours found matching your search.</p>
}
```

### 2.4 Deferrable Views (`@defer`)
To maximize hydration speed and initial page loads, heavy components (like maps, review carousels, or booking forms) must use `@defer`:
```html
@defer (on viewport) {
  <app-heavy-reviews-carousel />
} @placeholder {
  <div class="skeleton-loader">Loading reviews...</div>
} @loading (after 100ms; minimum 500ms) {
  <div class="spinner"></div>
}
```

---

## 3. Performance & SEO Guidelines

1. **Hydration Friendly**: Avoid touching the raw `document` or `window` directly inside construction or template bindings. Use platform checks (`isPlatformBrowser`) or dynamic checks if necessary.
2. **Responsive Images**: Use `NgOptimizedImage` from `@angular/common` for hero visuals to prevent layout shifts (CLS) and ensure automatic WebP conversion and srcsets.
3. **Lazy Loading**: All routes must be lazy-loaded using `loadComponent`:
   ```typescript
   export const routes: Routes = [
     {
       path: '',
       loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
     }
   ];
   ```

---

## 4. UI/UX & Design System

The application uses **Vanilla CSS** with a modern design system. Do not write inline styles.

### Core Variables (`styles.css`)
```css
:root {
  /* Color Palette - HSL tailored */
  --primary: hsl(200, 95%, 45%);       /* Bright travel blue */
  --primary-hover: hsl(200, 95%, 40%);
  --accent: hsl(28, 100%, 55%);        /* Warm sunset orange */
  --accent-hover: hsl(28, 100%, 50%);
  
  --bg-dark: hsl(220, 30%, 6%);        /* Sleek dark background */
  --bg-surface: hsl(220, 25%, 12%);    /* Card/surface background */
  --text-primary: hsl(0, 0%, 98%);     /* High contrast text */
  --text-secondary: hsl(220, 10%, 70%);/* Low contrast text */
  --border: hsla(0, 0%, 100%, 0.08);   /* Subtle transparent borders */
  
  /* Glassmorphism settings */
  --glass-bg: hsla(220, 25%, 12%, 0.6);
  --glass-border: hsla(0, 0%, 100%, 0.05);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-blur: blur(12px);
  
  /* Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```
