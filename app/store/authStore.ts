// app/store/authStore.ts

import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { superAdminAuthClient } from '../lib/api';
import { clearAuth, getToken, getUser, setToken, setUser } from '../lib/auth';
import { LoginCredentials, SuperAdmin } from '../types';

interface AuthStore {
  // State
  user: SuperAdmin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: async (credentials) => {
        console.log('🔐 Login attempt with:', credentials.username);
        set({ isLoading: true });

        try {
          const response = await superAdminAuthClient.post('/login', credentials);
          const data = response.data;

          console.log('📦 Login response:', data);

          if (data.success && data.token && data.data) {
            console.log('✅ Login successful, saving token and user');
            // Save to localStorage
            setToken(data.token);
            setUser(data.data);

            // Update state
            set({
              user: data.data,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success('Login successful');
            return true;
          } else {
            console.log('❌ Login failed:', data.message);
            toast.error(data.message || 'Login failed');
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          console.error('❌ Login error:', error);
          const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      // Logout action
      logout: () => {
        console.log('🚪 Logging out');
        clearAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        toast.success('Logged out successfully');

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      // Check authentication on app load
      checkAuth: () => {
        console.log('🔍 Checking authentication...');
        const token = getToken();
        const user = getUser();

        console.log('Token found:', token ? 'Yes' : 'No');
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
          console.log('User email:', user.email);
        }

        if (token && user) {
          console.log('✅ User is authenticated');
          set({
            user,
            token,
            isAuthenticated: true,
          });
          return true;
        }

        console.log('❌ User is NOT authenticated');
        set({ isAuthenticated: false });
        return false;
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'super-admin-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);