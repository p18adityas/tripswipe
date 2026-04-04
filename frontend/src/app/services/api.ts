/**
 * TripSwipe API client.
 * All calls go through the Vite proxy (/api → localhost:1337/api).
 */

const BASE = '/api';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('user-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.jwt || null;
    }
  } catch { /* ignore */ }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error?.message || res.statusText, body);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, message: string, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Types (matching Strapi response shapes)
// ---------------------------------------------------------------------------

export interface StrapiImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface ApiCity {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  cover_image: StrapiImage | null;
  country?: { id: number; name: string; code: string };
  state?: { id: number; name: string } | null;
}

export interface ApiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  type: string;
}

export interface ApiPlace {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  category: 'attraction' | 'activity' | 'stay';
  subcategory: string;
  short_description: string;
  description: string;
  rating: number | null;
  area: string | null;
  duration_label: string | null;
  duration_hours: number | null;
  cost_level: string | null;
  best_months: string[] | null;
  popularity_score: number;
  is_featured: boolean;
  extra_attributes: { image_urls?: string[]; mock_id?: string } | null;
  cover_image: StrapiImage | null;
  images: StrapiImage[] | null;
  tags: ApiTag[];
  city: { id: number; name: string; slug: string } | null;
  country: { id: number; name: string; code: string } | null;
  location: { latitude: number; longitude: number; address: string; google_maps_url: string } | null;
  operating_hours: { open: string; close: string; notes: string } | null;
  cost: { currency: string; min_price: number; max_price: number; price_note: string } | null;
}

export interface ApiSwipe {
  id: number;
  action: 'like' | 'super-like' | 'discard';
  createdAt: string;
  place: ApiPlace;
}

export interface ApiTrip {
  id: number;
  documentId: string;
  name: string;
  num_days: number;
  num_travelers: number;
  start_date: string | null;
  end_date: string | null;
  pace: 'relaxed' | 'balanced' | 'packed';
  budget: 'budget' | 'moderate' | 'luxury';
  food_preference: string | null;
  status: string;
  share_token: string;
  is_public: boolean;
  cover_image: StrapiImage | null;
  destination: { id: number; name: string; slug: string } | null;
  country: { id: number; name: string; code: string } | null;
  shortlisted_places: ApiPlace[];
  itinerary_items: ApiItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiItineraryItem {
  id: number;
  day_number: number;
  order_in_day: number;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  type: 'attraction' | 'activity' | 'stay' | 'transit' | 'meal' | 'free_time';
  place: ApiPlace | null;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  date_of_birth: string | null;
  passport: any | null;
  visa: any | null;
  profile_setup_complete: boolean;
}

interface StrapiListResponse<T> {
  data: T[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

interface StrapiSingleResponse<T> {
  data: T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const auth = {
  signUp(email: string, password: string, name: string) {
    return request<{ jwt: string; user: ApiUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  signIn(email: string, password: string) {
    return request<{ jwt: string; user: ApiUser }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  requestOtp(phone: string) {
    return request<{ success: boolean; message: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyOtp(phone: string, code: string) {
    return request<{ jwt: string; user: ApiUser }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  },

  google(id_token: string) {
    return request<{ jwt: string; user: ApiUser }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token }),
    });
  },

  profileSetup(data: { basicInfo?: any; passport?: any; visa?: any }) {
    return request<{ success: boolean; user: ApiUser }>('/auth/profile-setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe() {
    return request<StrapiSingleResponse<ApiUser>>('/users/me');
  },
};

// ---------------------------------------------------------------------------
// Cities & Places (public)
// ---------------------------------------------------------------------------

export const cities = {
  list(params?: string) {
    return request<StrapiListResponse<ApiCity>>(`/cities?populate=cover_image,country,state${params ? '&' + params : ''}`);
  },

  get(id: number) {
    return request<StrapiSingleResponse<ApiCity>>(`/cities/${id}?populate=cover_image,country,state`);
  },
};

export const places = {
  list(params?: string) {
    const base = '/places?populate=cover_image,images,tags,city,country,location,operating_hours,cost';
    return request<StrapiListResponse<ApiPlace>>(`${base}${params ? '&' + params : ''}`);
  },

  get(documentId: string) {
    return request<StrapiSingleResponse<ApiPlace>>(
      `/places/${documentId}?populate=cover_image,images,tags,city,country,location,operating_hours,cost`
    );
  },

  byCity(cityId: number, category?: string, page = 1, pageSize = 20) {
    let params = `filters[city][id]=${cityId}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=popularity_score:desc`;
    if (category) params += `&filters[category]=${category}`;
    return places.list(params);
  },
};

export const tags = {
  list() {
    return request<StrapiListResponse<ApiTag>>('/tags?pagination[pageSize]=100');
  },
};

// ---------------------------------------------------------------------------
// Swipes (authenticated)
// ---------------------------------------------------------------------------

export const swipes = {
  feed(cityId: number, category?: string, page = 1, pageSize = 20) {
    let params = `city=${cityId}&page=${page}&pageSize=${pageSize}`;
    if (category) params += `&category=${category}`;
    return request<{ data: ApiPlace[]; meta: { pagination: any } }>(`/swipes/feed?${params}`);
  },

  record(placeId: number, action: 'like' | 'super-like' | 'discard', tripContext?: number) {
    return request<{ data: any }>('/swipes', {
      method: 'POST',
      body: JSON.stringify({ place: placeId, action, ...(tripContext ? { trip_context: tripContext } : {}) }),
    });
  },

  undo(tripContext?: number) {
    return request<{ data: any }>('/swipes/undo', {
      method: 'POST',
      body: JSON.stringify(tripContext ? { trip_context: tripContext } : {}),
    });
  },

  my(action?: string, tripContext?: number) {
    let params = '';
    if (action) params += `action=${action}`;
    if (tripContext) params += `${params ? '&' : ''}trip_context=${tripContext}`;
    return request<{ data: ApiSwipe[] }>(`/swipes/my${params ? '?' + params : ''}`);
  },
};

// ---------------------------------------------------------------------------
// Trips (authenticated)
// ---------------------------------------------------------------------------

export const trips = {
  my(status?: string) {
    return request<{ data: ApiTrip[] }>(`/trips/my${status ? '?status=' + status : ''}`);
  },

  get(documentId: string) {
    return request<StrapiSingleResponse<ApiTrip>>(
      `/trips/${documentId}?populate=destination,country,cover_image,shortlisted_places.cover_image,itinerary_items.place.cover_image,itinerary_items.place.tags`
    );
  },

  create(data: {
    name: string;
    destination?: number;
    country?: number;
    num_days: number;
    num_travelers: number;
    start_date?: string;
    end_date?: string;
    pace?: string;
    budget?: string;
    food_preference?: string;
  }) {
    return request<StrapiSingleResponse<ApiTrip>>('/trips', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  update(documentId: string, data: Partial<ApiTrip>) {
    return request<StrapiSingleResponse<ApiTrip>>(`/trips/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  delete(documentId: string) {
    return request<any>(`/trips/${documentId}`, { method: 'DELETE' });
  },

  generateItinerary(id: number) {
    return request<{ data: { itinerary_items: ApiItineraryItem[] } }>(`/trips/${id}/generate-itinerary`, {
      method: 'POST',
    });
  },

  save(id: number) {
    return request<{ data: ApiTrip }>(`/trips/${id}/save`, { method: 'POST' });
  },

  archive(id: number) {
    return request<{ data: ApiTrip }>(`/trips/${id}/archive`, { method: 'POST' });
  },

  duplicate(id: number) {
    return request<{ data: ApiTrip }>(`/trips/${id}/duplicate`, { method: 'POST' });
  },

  share(id: number) {
    return request<{ share_token: string; share_url: string }>(`/trips/${id}/share`, { method: 'POST' });
  },

  shared(token: string) {
    return request<{ data: ApiTrip }>(`/trips/shared/${token}`);
  },
};

// ---------------------------------------------------------------------------
// Helpers for mapping Strapi data to frontend shapes
// ---------------------------------------------------------------------------

/** Get the best image URL for a place (from uploaded media or extra_attributes fallback) */
export function getPlaceImageUrl(place: ApiPlace, index = 0): string {
  // First try Strapi media
  if (index === 0 && place.cover_image?.url) {
    return place.cover_image.url;
  }
  if (place.images && place.images[index]?.url) {
    return place.images[index].url;
  }
  // Fallback to extra_attributes image URLs (Unsplash from seed data)
  if (place.extra_attributes?.image_urls?.[index]) {
    return place.extra_attributes.image_urls[index];
  }
  if (place.extra_attributes?.image_urls?.[0]) {
    return place.extra_attributes.image_urls[0];
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
}

/** Get all image URLs for a place */
export function getPlaceImages(place: ApiPlace): string[] {
  // Prefer Strapi media
  if (place.images && place.images.length > 0) {
    return place.images.map(img => img.url);
  }
  // Fallback to extra_attributes
  return place.extra_attributes?.image_urls || [];
}

/** Map cost_level enum to display string */
export function formatPriceLevel(costLevel: string | null): string {
  const map: Record<string, string> = {
    free: 'Free',
    budget: '₹',
    moderate: '₹₹',
    premium: '₹₹₹',
    luxury: '₹₹₹₹',
  };
  return map[costLevel || ''] || '₹₹';
}

/** Map API place to the shape the frontend components expect */
export function toFrontendPlace(p: ApiPlace) {
  return {
    id: p.documentId || String(p.id),
    cityId: String(p.city?.id || ''),
    name: p.name,
    category: p.subcategory || p.category,
    images: getPlaceImages(p),
    description: p.short_description || '',
    detailedDescription: p.description || '',
    tags: p.tags?.map(t => t.name) || [],
    area: p.area || '',
    duration: p.duration_label || '',
    priceLevel: formatPriceLevel(p.cost_level),
    rating: p.rating || 0,
    openHours: p.operating_hours
      ? (p.operating_hours.open && p.operating_hours.close
          ? `${p.operating_hours.open} - ${p.operating_hours.close}`
          : p.operating_hours.notes || undefined)
      : undefined,
    bestTime: p.best_months?.[0] || undefined,
    // Keep the API id for backend calls
    _apiId: p.id,
    _documentId: p.documentId,
  };
}

/** Map API city to frontend shape */
export function toFrontendCity(c: ApiCity) {
  const stateName = c.state?.name;
  const countryName = c.country?.name || 'India';
  return {
    id: String(c.id),
    name: c.name,
    country: stateName ? `${stateName}, ${countryName}` : countryName,
    image: c.cover_image?.url || c.extra_attributes?.image_urls?.[0] || '',
    _apiId: c.id,
    _documentId: c.documentId,
  };
}
