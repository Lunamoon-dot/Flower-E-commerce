import api from "./api"
import type { Product, Order, Review, Voucher } from "@/types"

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
}

export interface RevenueMonth {
  month: string
  revenue: number
  orders: number
}

export interface RevenueDay {
  day: string
  revenue: number
  orders: number
}

export interface OrderStatusData {
  status: string
  count: number
}

export interface LowStockProduct {
  _id: string
  name: string
  stock: number
  category: string
}

export interface DashboardResponse {
  stats: DashboardStats
  revenueByDay: RevenueDay[]
  revenueByMonth: RevenueMonth[]
  orderStatusData: OrderStatusData[]
  lowStockProducts: LowStockProduct[]
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: "user" | "admin" | "superadmin" | "salestaff"
  createdAt: string
}

export const adminService = {
  // Dashboard
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get("/admin/dashboard/stats")
    return data
  },
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },

  // Users
  getUsers: async (page = 1, limit = 20): Promise<{ data: AdminUser[]; total: number; totalPages: number; page: number }> => {
    const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`)
    return data
  },
  updateUserRole: async (id: string, role: "user" | "admin"): Promise<AdminUser> => {
    const { data } = await api.put(`/admin/users/${id}/role`, { role })
    return data
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  // Orders
  getOrders: async (page = 1, limit = 20): Promise<{ data: Order[]; total: number; totalPages: number; page: number }> => {
    const { data } = await api.get(`/admin/orders?page=${page}&limit=${limit}`)
    return data
  },
  getOrder: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/admin/orders/${id}`)
    return data
  },
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const { data } = await api.put(`/admin/orders/${id}/status`, { status })
    return data
  },

  // Products
  getProducts: async (page = 1, limit = 20): Promise<{ data: Product[]; total: number; totalPages: number; page: number }> => {
    const { data } = await api.get(`/admin/products?page=${page}&limit=${limit}`)
    return data
  },
  createProduct: async (productData: Omit<Product, "_id" | "createdAt" | "rating" | "numReviews">): Promise<Product> => {
    const { data } = await api.post("/admin/products", productData)
    return data
  },
  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const { data } = await api.put(`/admin/products/${id}`, productData)
    return data
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`)
  },

  // Vouchers
  getVouchers: async (page = 1, limit = 20): Promise<{ data: any[]; total: number; totalPages: number; page: number }> => {
    const { data } = await api.get(`/admin/vouchers?page=${page}&limit=${limit}`)
    return data
  },
  createVoucher: async (voucherData: Partial<Voucher>): Promise<Voucher> => {
    const { data } = await api.post("/admin/vouchers", voucherData)
    return data
  },
  updateVoucher: async (id: string, voucherData: Partial<Voucher>): Promise<Voucher> => {
    const { data } = await api.put(`/admin/vouchers/${id}`, voucherData)
    return data
  },
  deleteVoucher: async (id: string): Promise<void> => {
    await api.delete(`/admin/vouchers/${id}`)
  },

  // Reviews
  getReviews: async (page = 1, limit = 20): Promise<{ data: any[]; total: number; totalPages: number; page: number }> => {
    const { data } = await api.get(`/admin/reviews?page=${page}&limit=${limit}`)
    return data
  },
  updateReview: async (id: string, reviewData: Partial<Review>): Promise<Review> => {
    const { data } = await api.put(`/admin/reviews/${id}`, reviewData)
    return data
  },
  getReviewOrder: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/admin/reviews/${id}/order`)
    return data
  },

  // Logs
  getLogs: async (page = 1, limit = 20): Promise<{ data: any[]; total: number; totalPages: number; page: number }> => {
    const { data } = await api.get(`/admin/logs?page=${page}&limit=${limit}`)
    return data
  },
}
