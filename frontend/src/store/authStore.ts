import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  market: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  market: string;
  companyName: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login({ email, password });
          set({ user: res.user, token: res.token, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(data);
          set({ user: res.user, token: res.token, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'truckbiz-auth' }
  )
);
