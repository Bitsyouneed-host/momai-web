export interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  openNow?: boolean;
  distance?: number;
  location?: {
    lat: number;
    lng: number;
  };
  photos?: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  hours?: string[];
  reviews?: PlaceReview[];
  photos?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

export interface PlaceReview {
  authorName: string;
  rating: number;
  text: string;
  time: number;
  authorPhoto?: string;
}
