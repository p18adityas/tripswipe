import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Place, Selection, ItineraryDetails } from '../data/mockData';
import { trips as tripsApi, ApiTrip, ApiItineraryItem, toFrontendPlace, getPlaceImages } from '../services/api';

export type TripStatus = 'draft' | 'saved' | 'shared' | 'archived';

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  items: {
    id: string;
    place: Place;
    startTime: string;
    endTime: string;
    duration: number;
    type: 'activity' | 'meal' | 'travel';
    notes?: string;
  }[];
}

export interface Trip {
  id: string;
  title: string;
  cityId: string;
  cityName: string;
  status: TripStatus;
  coverImage: string;
  createdAt: number;
  updatedAt: number;
  itineraryDetails: ItineraryDetails;
  days: ItineraryDay[];
  selections: Selection[];
  shareLink?: string;
  _apiId?: number;
  _documentId?: string;
}

/** Convert API itinerary items into frontend ItineraryDay[] */
function apiItemsToDays(items: ApiItineraryItem[]): ItineraryDay[] {
  const dayMap = new Map<number, ItineraryDay>();

  for (const item of items) {
    if (!dayMap.has(item.day_number)) {
      dayMap.set(item.day_number, { dayNumber: item.day_number, items: [] });
    }
    const day = dayMap.get(item.day_number)!;

    const frontendPlace = item.place ? toFrontendPlace(item.place) : null;
    const typeMap: Record<string, string> = {
      attraction: 'activity',
      activity: 'activity',
      stay: 'activity',
      meal: 'meal',
      transit: 'travel',
      free_time: 'activity',
    };

    day.items.push({
      id: String(item.id),
      place: (frontendPlace || { id: 'meal', name: item.notes || 'Break', category: 'Meal', images: [], description: '', detailedDescription: '', tags: [], area: '', duration: '', priceLevel: '', rating: 0 }) as Place,
      startTime: item.start_time || '',
      endTime: item.end_time || '',
      duration: 1,
      type: (typeMap[item.type] || 'activity') as 'activity' | 'meal' | 'travel',
      notes: item.notes || undefined,
    });
  }

  return Array.from(dayMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);
}

/** Convert API trip to frontend Trip */
function apiTripToFrontend(t: ApiTrip, selections: Selection[] = []): Trip {
  const cityName = t.destination?.name || '';
  const images = t.shortlisted_places?.[0] ? getPlaceImages(t.shortlisted_places[0]) : [];

  return {
    id: t.documentId || String(t.id),
    title: t.name,
    cityId: String(t.destination?.id || ''),
    cityName,
    status: (t.status as TripStatus) || 'draft',
    coverImage: images[0] || '',
    createdAt: new Date(t.createdAt).getTime(),
    updatedAt: new Date(t.updatedAt).getTime(),
    itineraryDetails: {
      name: t.name,
      numberOfDays: t.num_days,
      numberOfPeople: t.num_travelers,
      pace: t.pace || 'balanced',
      budget: t.budget || 'moderate',
      foodPreference: t.food_preference || '',
      startDate: t.start_date || undefined,
      endDate: t.end_date || undefined,
    },
    days: t.itinerary_items ? apiItemsToDays(t.itinerary_items) : [],
    selections,
    shareLink: t.share_token ? `${window.location.origin}/trip/${t.share_token}` : undefined,
    _apiId: t.id,
    _documentId: t.documentId,
  };
}

interface TripState {
  trips: Trip[];
  currentTripId: string | null;
  loading: boolean;

  // API-backed operations
  fetchTrips: (status?: string) => Promise<void>;
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => string;
  createTripViaApi: (data: {
    name: string;
    destination?: number;
    num_days: number;
    num_travelers: number;
    pace?: string;
    budget?: string;
    food_preference?: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  archiveTrip: (tripId: string) => void;
  duplicateTrip: (tripId: string) => string;
  saveTripToApi: (tripId: string) => Promise<void>;
  archiveTripViaApi: (tripId: string) => Promise<void>;
  duplicateTripViaApi: (tripId: string) => Promise<Trip>;
  generateItineraryViaApi: (tripId: string) => Promise<ItineraryDay[]>;
  shareTripViaApi: (tripId: string) => Promise<string>;

  // Trip retrieval
  getTrip: (tripId: string) => Trip | undefined;
  getTripsByStatus: (status: TripStatus) => Trip[];
  getAllTrips: () => Trip[];

  // Current trip
  setCurrentTrip: (tripId: string | null) => void;
  getCurrentTrip: () => Trip | undefined;

  // Local itinerary editing
  updateItineraryDay: (tripId: string, dayNumber: number, day: ItineraryDay) => void;
  removeItineraryItem: (tripId: string, dayNumber: number, itemId: string) => void;
  reorderItineraryItems: (tripId: string, dayNumber: number, fromIndex: number, toIndex: number) => void;
  moveItemBetweenDays: (tripId: string, fromDay: number, toDay: number, itemId: string) => void;

  // Share (local fallback)
  generateShareLink: (tripId: string) => string;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTripId: null,
      loading: false,

      fetchTrips: async (status) => {
        set({ loading: true });
        try {
          const res = await tripsApi.my(status);
          const fetched = (res.data || []).map(t => apiTripToFrontend(t));
          set({ trips: fetched, loading: false });
        } catch {
          set({ loading: false });
        }
      },

      // Local-only create (for pre-auth flow)
      createTrip: (tripData) => {
        const id = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const trip: Trip = { ...tripData, id, createdAt: now, updatedAt: now };
        set((state) => ({ trips: [...state.trips, trip] }));
        return id;
      },

      // API-backed create
      createTripViaApi: async (data) => {
        const res = await tripsApi.create(data);
        const trip = apiTripToFrontend(res.data);
        set((state) => ({ trips: [...state.trips, trip] }));
        return trip;
      },

      updateTrip: (tripId, updates) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId ? { ...trip, ...updates, updatedAt: Date.now() } : trip
          ),
        }));
      },

      deleteTrip: (tripId) => {
        const trip = get().getTrip(tripId);
        if (trip?._apiId) {
          // Fire-and-forget delete
          const docId = trip._documentId || trip.id;
          tripsApi.delete(docId).catch(() => {});
        }
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== tripId),
          currentTripId: state.currentTripId === tripId ? null : state.currentTripId,
        }));
      },

      archiveTrip: (tripId) => {
        get().updateTrip(tripId, { status: 'archived' });
      },

      duplicateTrip: (tripId) => {
        const trip = get().getTrip(tripId);
        if (!trip) return '';
        return get().createTrip({
          ...trip,
          title: `${trip.title} (Copy)`,
          status: 'draft',
          shareLink: undefined,
        });
      },

      saveTripToApi: async (tripId) => {
        const trip = get().getTrip(tripId);
        if (trip?._apiId) {
          await tripsApi.save(trip._apiId);
          get().updateTrip(tripId, { status: 'saved' });
        }
      },

      archiveTripViaApi: async (tripId) => {
        const trip = get().getTrip(tripId);
        if (trip?._apiId) {
          await tripsApi.archive(trip._apiId);
          get().updateTrip(tripId, { status: 'archived' });
        }
      },

      duplicateTripViaApi: async (tripId) => {
        const trip = get().getTrip(tripId);
        if (!trip?._apiId) throw new Error('Trip not synced');
        const res = await tripsApi.duplicate(trip._apiId);
        const newTrip = apiTripToFrontend(res.data);
        set((state) => ({ trips: [...state.trips, newTrip] }));
        return newTrip;
      },

      generateItineraryViaApi: async (tripId) => {
        const trip = get().getTrip(tripId);
        if (!trip?._apiId) throw new Error('Trip not synced');
        const res = await tripsApi.generateItinerary(trip._apiId);
        const days = apiItemsToDays(res.data.itinerary_items);
        get().updateTrip(tripId, { days, status: 'planned' as any });
        return days;
      },

      shareTripViaApi: async (tripId) => {
        const trip = get().getTrip(tripId);
        if (!trip?._apiId) throw new Error('Trip not synced');
        const res = await tripsApi.share(trip._apiId);
        const shareLink = res.share_url;
        get().updateTrip(tripId, { shareLink, status: 'shared' });
        return shareLink;
      },

      getTrip: (tripId) => get().trips.find((t) => t.id === tripId),

      getTripsByStatus: (status) => get().trips.filter((t) => t.status === status),

      getAllTrips: () => get().trips,

      setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

      getCurrentTrip: () => {
        const { currentTripId, trips } = get();
        if (!currentTripId) return undefined;
        return trips.find((t) => t.id === currentTripId);
      },

      updateItineraryDay: (tripId, dayNumber, day) => {
        const trip = get().getTrip(tripId);
        if (!trip) return;
        const updatedDays = [...trip.days];
        const idx = updatedDays.findIndex((d) => d.dayNumber === dayNumber);
        if (idx >= 0) updatedDays[idx] = day;
        else updatedDays.push(day);
        get().updateTrip(tripId, { days: updatedDays });
      },

      removeItineraryItem: (tripId, dayNumber, itemId) => {
        const trip = get().getTrip(tripId);
        if (!trip) return;
        const updatedDays = trip.days.map((day) =>
          day.dayNumber === dayNumber
            ? { ...day, items: day.items.filter((item) => item.id !== itemId) }
            : day
        );
        get().updateTrip(tripId, { days: updatedDays });
      },

      reorderItineraryItems: (tripId, dayNumber, fromIndex, toIndex) => {
        const trip = get().getTrip(tripId);
        if (!trip) return;
        const updatedDays = trip.days.map((day) => {
          if (day.dayNumber !== dayNumber) return day;
          const items = [...day.items];
          const [removed] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, removed);
          return { ...day, items };
        });
        get().updateTrip(tripId, { days: updatedDays });
      },

      moveItemBetweenDays: (tripId, fromDay, toDay, itemId) => {
        const trip = get().getTrip(tripId);
        if (!trip) return;
        let itemToMove: (typeof trip.days)[0]['items'][0] | null = null;
        const updatedDays = trip.days.map((day) => {
          if (day.dayNumber === fromDay) {
            const item = day.items.find((i) => i.id === itemId);
            if (item) {
              itemToMove = item;
              return { ...day, items: day.items.filter((i) => i.id !== itemId) };
            }
          }
          return day;
        });
        if (itemToMove) {
          const finalDays = updatedDays.map((day) => {
            if (day.dayNumber === toDay) {
              return { ...day, items: [...day.items, itemToMove!] };
            }
            return day;
          });
          get().updateTrip(tripId, { days: finalDays });
        }
      },

      generateShareLink: (tripId) => {
        const shareLink = `${window.location.origin}/trip/${tripId}`;
        get().updateTrip(tripId, { shareLink, status: 'shared' });
        return shareLink;
      },
    }),
    {
      name: 'trip-storage',
    }
  )
);
