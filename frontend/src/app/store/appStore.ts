import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Place, Selection, ItineraryDetails } from '../data/mockData';
import { swipes as swipesApi } from '../services/api';

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
}

interface AppState {
  selectedCity: string | null;
  selectedCityApiId: number | null;
  selections: Selection[];
  discarded: string[];
  history: Array<{ type: 'like' | 'super-like' | 'discard'; placeId: string; apiPlaceId?: number; timestamp: number }>;
  itineraryDetails: ItineraryDetails | null;
  currentTripApiId: number | null;

  setSelectedCity: (cityId: string, apiId?: number) => void;
  setCurrentTripApiId: (id: number | null) => void;
  addSelection: (place: Place, type: 'like' | 'super-like') => void;
  addDiscard: (placeId: string) => void;
  removeSelection: (placeId: string) => void;
  undo: () => void;
  clearHistory: () => void;
  setItineraryDetails: (details: ItineraryDetails) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>(persist((set, get) => ({
  selectedCity: null,
  selectedCityApiId: null,
  selections: [],
  discarded: [],
  history: [],
  itineraryDetails: null,
  currentTripApiId: null,

  setSelectedCity: (cityId, apiId) => set({ selectedCity: cityId, selectedCityApiId: apiId || null }),

  setCurrentTripApiId: (id) => set({ currentTripApiId: id }),

  addSelection: (place, type) => {
    const state = get();
    set({
      selections: [...state.selections, { place, type, timestamp: Date.now() }],
      history: [...state.history, { type, placeId: place.id, apiPlaceId: (place as any)._apiId, timestamp: Date.now() }],
    });

    // Fire-and-forget API call to record the swipe
    const apiId = (place as any)._apiId;
    if (apiId) {
      swipesApi.record(apiId, type, state.currentTripApiId || undefined).catch(() => {});
    }
  },

  addDiscard: (placeId) => {
    const state = get();
    // Find the apiId from current context
    const apiPlaceId = (state.history.find(h => h.placeId === placeId) as any)?._apiPlaceId;
    set({
      discarded: [...state.discarded, placeId],
      history: [...state.history, { type: 'discard', placeId, apiPlaceId, timestamp: Date.now() }],
    });

    // Fire-and-forget API call
    if (apiPlaceId) {
      swipesApi.record(apiPlaceId, 'discard', state.currentTripApiId || undefined).catch(() => {});
    }
  },

  removeSelection: (placeId) => {
    const state = get();
    set({
      selections: state.selections.filter(s => s.place.id !== placeId),
    });
  },

  undo: () => {
    const state = get();
    if (state.history.length === 0) return;

    const lastAction = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);

    if (lastAction.type === 'discard') {
      set({
        discarded: state.discarded.filter(id => id !== lastAction.placeId),
        history: newHistory,
      });
    } else {
      set({
        selections: state.selections.filter(s => s.place.id !== lastAction.placeId),
        history: newHistory,
      });
    }

    // Fire-and-forget API undo
    swipesApi.undo(state.currentTripApiId || undefined).catch(() => {});
  },

  clearHistory: () => set({ history: [] }),

  setItineraryDetails: (details) => set({ itineraryDetails: details }),

  reset: () => set({
    selectedCity: null,
    selectedCityApiId: null,
    selections: [],
    discarded: [],
    history: [],
    itineraryDetails: null,
    currentTripApiId: null,
  }),
}), {
  name: 'app-store',
}));
