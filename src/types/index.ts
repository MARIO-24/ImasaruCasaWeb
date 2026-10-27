export type BookingStatus = 'booked' | 'blocked' | 'maintenance';

export interface Booking {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status: BookingStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingInput {
  start_date: string;
  end_date: string;
  status: BookingStatus;
  notes?: string;
}

export interface AdminProfile {
  user_id: string;
  email: string;
  created_at?: string;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number; // 1-5
  comment: string;
  stay_date?: string;
  approved: boolean;
  created_at?: string;
}

export interface Amenity {
  name: string;
  description: string;
  iconName: string;
  category: 'interior' | 'exterior' | 'comfort';
}

export interface SpaceDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  badge?: string;
}

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  category: 'exterior' | 'interior' | 'piscina' | 'porche';
  alt: string;
  widthSpan?: string; // for asymmetrical grid
}

