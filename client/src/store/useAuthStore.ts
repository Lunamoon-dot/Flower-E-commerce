import { create } from "zustand"
import { AxiosError } from "axios"
import type { User } from "@/types"
import { authService } from "@/services/authService"

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
  token: localStorage.getItem("auth-token"),
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await authService.login(email, password)
      localStorage.setItem("auth-token", token)
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
      localStorage.setItem("auth-token", token)
      set({ user, token, isLoading: false })
    } catch (err: unknown) {
      set({
        error: extractErrorMessage(err, "Đăng ký thất bại"),
        isLoading: false,
      })
    }
  },

  logout: () => {
    localStorage.removeItem("auth-token")
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),

  loadUser: async () => {
    const token = localStorage.getItem("auth-token")
    if (!token) {
      set({ isInitializing: false })
      return
    }
    set({ token, isInitializing: true })
    try {
      const user = await authService.getProfile()
      set({ user, isInitializing: false })
    } catch {
      localStorage.removeItem("auth-token")
      set({ user: null, token: null, isInitializing: false })
    }
  },
}))
