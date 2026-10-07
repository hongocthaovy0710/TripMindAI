// ─── Core Types ────────────────────────────────────────────────────────────

export type Priority = 'high' | 'medium' | 'low';
export type TripStatus = 'planning' | 'upcoming' | 'completed';
export type PlaceCategory = 'attraction' | 'restaurant' | 'cafe' | 'hotel' | 'activity' | 'shopping';
export type TravelStyle = 'chill' | 'adventure' | 'culture' | 'food' | 'nature' | 'photography';
export type TransportType = 'taxi' | 'motorbike' | 'car' | 'bus' | 'train' | 'flight';
export type AccommodationType = 'hotel' | 'homestay' | 'villa' | 'hostel';
export type BudgetRange = 'under1m' | '1m-3m' | '3m-5m' | '5m-10m' | 'over10m';

// ─── User ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  preferredStyle?: TravelStyle[];
  preferredBudget?: BudgetRange;
  preferredTransport?: TransportType;
  preferredAccommodation?: AccommodationType;
  stats: {
    tripsCompleted: number;
    placesSaved: number;
    citiesVisited: number;
  };
}

// ─── Destination ──────────────────────────────────────────────────────────

export interface Destination {
  id: string;
  name: string;
  province: string;
  description: string;
  image: string;
  rating: number;
  placesCount: number;
  categories: PlaceCategory[];
  tags: string[];
  popular: boolean;
}

// ─── Place ────────────────────────────────────────────────────────────────

export interface Place {
  id: string;
  destinationId: string;
  name: string;
  category: PlaceCategory;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  price: number; // VND
  priceLabel?: string;
  location: string;
  address?: string;
  openHours?: string;
  phone?: string;
  tags: string[];
  aiSuggestion?: string;
  nearbyPlaces?: string[]; // ids
  coordinates?: { lat: number; lng: number };
}

// ─── Hotel ────────────────────────────────────────────────────────────────

export interface Hotel {
  id: string;
  destinationId: string;
  name: string;
  type: AccommodationType;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  pricePerNight: number; // VND
  location: string;
  address?: string;
  amenities: string[];
  tags: string[];
  coordinates?: { lat: number; lng: number };
}

// ─── Restaurant ───────────────────────────────────────────────────────────

export interface Restaurant {
  id: string;
  destinationId: string;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string; // e.g. "30.000 - 120.000"
  avgPrice: number;
  location: string;
  address?: string;
  openHours?: string;
  tags: string[];
  category: 'local' | 'restaurant' | 'cafe' | 'street' | 'dessert' | 'fine';
}

// ─── Transport ────────────────────────────────────────────────────────────

export interface TransportOption {
  id: string;
  type: TransportType;
  label: string;
  icon: string;
  description: string;
  estimatedPrice: string;
  duration?: string;
  providers?: string[];
  rating?: number;
}

// ─── Activity (within a day plan) ────────────────────────────────────────

export interface Activity {
  id?: string;
  name: string;
  time?: string;
  duration?: string;
  location?: string;
  address?: string;
  cost: number;
  priority: Priority;
  category?: PlaceCategory;
  image?: string;
  notes?: string;
  placeId?: string;
}

// ─── Day Plan ─────────────────────────────────────────────────────────────

export interface DayPlan {
  day: number;
  date?: string;
  activities: Activity[];
}

// ─── Trip ─────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  userId?: string;
  destination: string;
  destinationId?: string;
  coverImage?: string;
  days: number;
  startDate?: string;
  endDate?: string;
  budget: number;
  estimated_cost: number;
  within_budget?: boolean;
  preferences: string[];
  status: TripStatus;
  travelStyle?: TravelStyle[];
  transport?: TransportType;
  accommodation?: AccommodationType;
  travelers?: number;
  itinerary: DayPlan[];
  hotelId?: string;
  notes?: string;
  created_at?: string;
  budgetBreakdown?: BudgetBreakdown;
}

export interface BudgetBreakdown {
  hotel: number;
  food: number;
  transport: number;
  activities: number;
  shopping: number;
  other: number;
}

// ─── Itinerary (from API) ─────────────────────────────────────────────────

export interface Itinerary {
  destination: string;
  days: number;
  budget: number;
  estimated_cost: number;
  within_budget: boolean;
  itinerary: DayPlan[];
}

// ─── Notification ─────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

// ─── Filter/Search ────────────────────────────────────────────────────────

export interface SearchFilters {
  query?: string;
  category?: PlaceCategory | 'all';
  destinationId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
}
