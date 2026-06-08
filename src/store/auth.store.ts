import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequestDTO, RegisterRequestDTO } from '../domain/auth.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  
  login: (data: LoginRequestDTO) => Promise<void>;
  register: (data: RegisterRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: true,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => {
        set({ user });
      },

      login: async (data: LoginRequestDTO) => {
        set({ loading: true });
        try {
          const response = await authService.login(data);
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            isAuthenticated: true,
          });
        } finally {
          set({ loading: false });
        }
      },

      register: async (data: RegisterRequestDTO) => {
        set({ loading: true });
        try {
          // Fase 1: Cadastro
          await authService.register(data);
          // Fase 2: Login Automático
          await get().login({ email: data.email, password: data.password });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        set({ loading: true });
        try {
          if (refreshToken) {
            await authService.logout(refreshToken).catch(() => {});
          }
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
          });
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      loadCurrentUser: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ loading: false });
          return;
        }

        set({ loading: true });
        try {
          const user = await authService.me();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // Erros como 401 já são interceptados e o refresh é tentado.
          // Se o interceptor falhar e chamar o logout(), a store já estará limpa.
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'survey-auth-storage', // Nome da key no LocalStorage
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken 
      }), // Só persistimos os tokens para evitar dados stale do usuário.
    }
  )
);
