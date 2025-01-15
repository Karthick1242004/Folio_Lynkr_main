import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

interface FormState {
  subdomain: string;
  availability: string | null;
  loading: boolean;
  setSubdomain: (subdomain: string) => void;
  setAvailability: (availability: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface NavigationState {
  isNavOpen: boolean;
  setIsNavOpen: (isOpen: boolean) => void;
}

interface Store extends ThemeState, FormState, NavigationState {}

export const useStore = create<Store>((set) => ({
  // Theme state
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  // Form state
  subdomain: '',
  availability: null,
  loading: false,
  setSubdomain: (subdomain) => set({ subdomain }),
  setAvailability: (availability) => set({ availability }),
  setLoading: (loading) => set({ loading }),

  // Navigation state
  isNavOpen: false,
  setIsNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
}));
