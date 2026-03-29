import type { AuthResponse } from "@/types"
import api from "./api"

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post("/auth/login", { email, password })
    return data
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post("/auth/register", { name, email, password })
    return data
  },

  async getProfile() {
    const { data } = await api.get("/auth/me")
    return data
  },

  async logout() {
    const { data } = await api.post("/auth/logout")
    return data
  },
}
