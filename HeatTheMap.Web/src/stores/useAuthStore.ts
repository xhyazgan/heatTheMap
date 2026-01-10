import { create } from 'zustand';
import { authService } from '../services/auth.service';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: authService.isAuthenticated(),
  username: null,

  login: async (username: string, password: string) => {
    const response = await authService.login(username, password);
    set({ isAuthenticated: true, username: response.username });
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false, username: null });
  },

  checkAuth: () => {
    set({ isAuthenticated: authService.isAuthenticated() });
  },
}));
