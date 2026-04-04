import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, ApiUser } from '../services/api';

export interface PassportDetails {
  country: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  holderName: string;
}

export interface VisaDetails {
  country: string;
  type: string;
  countries: string[];
  expiryDate: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  countryOfResidence: string;
  nationality: string;
  dateOfBirth?: string;
  passport?: PassportDetails;
  visa?: VisaDetails;
}

interface UserState {
  isAuthenticated: boolean;
  jwt: string | null;
  user: UserProfile | null;
  profileSetupComplete: boolean;
  pendingAction: { type: 'save' | 'share'; context: any } | null;

  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;

  updateProfile: (profile: Partial<UserProfile>) => void;
  completeProfileSetup: () => void;
  submitProfileSetup: (data: { basicInfo?: any; passport?: any; visa?: any }) => Promise<void>;

  setPendingAction: (action: { type: 'save' | 'share'; context: any } | null) => void;
  getPendingAction: () => { type: 'save' | 'share'; context: any } | null;
  clearPendingAction: () => void;
}

function apiUserToProfile(u: ApiUser): UserProfile {
  return {
    fullName: u.display_name || u.username || '',
    email: u.email || '',
    phone: u.phone || undefined,
    countryOfResidence: u.country_of_residence || '',
    nationality: u.nationality || '',
    dateOfBirth: u.date_of_birth || undefined,
    passport: u.passport || undefined,
    visa: u.visa || undefined,
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      jwt: null,
      user: null,
      profileSetupComplete: false,
      pendingAction: null,

      signUp: async (email, password, name) => {
        const res = await auth.signUp(email, password, name);
        set({
          isAuthenticated: true,
          jwt: res.jwt,
          user: apiUserToProfile(res.user),
          profileSetupComplete: res.user.profile_setup_complete || false,
        });
      },

      signIn: async (email, password) => {
        const res = await auth.signIn(email, password);
        set({
          isAuthenticated: true,
          jwt: res.jwt,
          user: apiUserToProfile(res.user),
          profileSetupComplete: res.user.profile_setup_complete || false,
        });
      },

      signOut: () => {
        set({
          isAuthenticated: false,
          jwt: null,
          pendingAction: null,
        });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      completeProfileSetup: () => {
        set({ profileSetupComplete: true });
      },

      submitProfileSetup: async (data) => {
        const res = await auth.profileSetup(data);
        set({
          user: apiUserToProfile(res.user),
          profileSetupComplete: true,
        });
      },

      setPendingAction: (action) => {
        set({ pendingAction: action });
      },

      getPendingAction: () => {
        return get().pendingAction;
      },

      clearPendingAction: () => {
        set({ pendingAction: null });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
