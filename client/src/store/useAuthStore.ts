import { create } from "zustand"
import { AxiosError } from "axios"
import type { User } from "@/types"
import { authService } from "@/services/authService"
import api, { setToken } from "@/services/api"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitializing: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  loadUser: () => Promise<void>
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await authService.login(email, password)
      setToken(token)
      set({ user, token, isLoading: false })
    } catch (err: unknown) {
      set({
        error: extractErrorMessage(err, "Đăng nhập thất bại"),
        isLoading: false,
      })
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await authService.register(name, email, password)
      setToken(token)
      set({ user, token, isLoading: false })
    } catch (err: unknown) {
      set({
        error: extractErrorMessage(err, "Đăng ký thất bại"),
        isLoading: false,
      })
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore
    }
    setToken(null)
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),

  loadUser: async () => {
    set({ isInitializing: true })
    try {
      // First try to refresh the token directly via api interceptor or explicit call
      // Because we don't know if we have a valid refresh cookie, we can try to call /auth/me implicitly
      // But if we don't have token in memory, calling /auth/me will fail with 401, which will trigger the interceptor to refresh
      const { data } = await api.post("/auth/refresh");
      setToken(data.token);
      set({ token: data.token });
      
      const user = await authService.getProfile()
      set({ user, isInitializing: false })
    } catch {
      setToken(null)
      set({ user: null, token: null, isInitializing: false })
    }
  },
}))
