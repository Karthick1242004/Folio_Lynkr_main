import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AuthState {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

interface PaymentState {
  isPaymentComplete: boolean;
  setPaymentComplete: (status: boolean) => void;
}

interface Store extends ThemeState, FormState, NavigationState, AuthState, PaymentState {}

export const useStore = create<Store>()(
  persist(
    (set) => ({
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

      // Auth state
      showDropdown: false,
      setShowDropdown: (show) => set({ showDropdown: show }),

      // Payment state
      isPaymentComplete: false,
      setPaymentComplete: (status) => set({ isPaymentComplete: status }),
    }),
    {
      name: 'theme-storage', // name of the item in localStorage
      partialize: (state) => ({ isDark: state.isDark }), // only persist isDark
    }
  )
);
