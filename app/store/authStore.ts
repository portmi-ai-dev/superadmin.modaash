// app/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { superAdminAuthClient } from '../lib/api';
import { setToken, setUser, clearAuth, getUser, getToken } from '../lib/auth';
import { SuperAdmin, LoginCredentials, ApiResponse } from '../types';
import toast from 'react-hot-toast';

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
        set({ isLoading: true });
        
        try {
          const response = await superAdminAuthClient.post('/login', credentials);
          const data = response.data;
          
          if (data.success && data.token && data.data) {
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
            toast.error(data.message || 'Login failed');
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      // Logout action
      logout: () => {
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
        const token = getToken();
        const user = getUser();
        
        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
          return true;
        }
        
        set({ isAuthenticated: false });
        return false;
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'super-admin-storage', // name for localStorage
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }), // only persist these
    }
  )
);