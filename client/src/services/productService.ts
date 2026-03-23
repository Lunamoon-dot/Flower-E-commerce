import type { Product, ProductFilters, PaginatedResponse } from "@/types"
import api from "./api"

export const productService = {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get("/products", { params: filters })
    return {
      data: data.products,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    }
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`)
    return data
  },

  async getFeatured(): Promise<Product[]> {
    const { data } = await api.get("/products", {
      params: { featured: true, limit: 8 },
    })
    return data.products || []
  },

  async getByCategory(category: string): Promise<Product[]> {
    const { data } = await api.get("/products", {
      params: { category },
    })
    return data.products || []
  },
}
