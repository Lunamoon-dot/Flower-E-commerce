import api from "./api"
import type { Product, Order, Voucher, Review, ActivityLog } from "@/types"

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
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },

  // Users
  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get("/admin/users")
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
  getOrders: async (): Promise<Order[]> => {
    const { data } = await api.get("/admin/orders")
    return data
  },
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const { data } = await api.put(`/admin/orders/${id}/status`, { status })
    return data
  },

  // Products
  getProducts: async (): Promise<{ products: Product[]; total: number }> => {
    const { data } = await api.get("/admin/products?limit=100")
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
  getVouchers: async (): Promise<Voucher[]> => {
    const { data } = await api.get("/admin/vouchers")
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
  getReviews: async (): Promise<Review[]> => {
    const { data } = await api.get("/admin/reviews")
    return data
  },
  updateReview: async (id: string, reviewData: Partial<Review>): Promise<Review> => {
    const { data } = await api.put(`/admin/reviews/${id}`, reviewData)
    return data
  },

  // Logs
  getLogs: async (): Promise<ActivityLog[]> => {
    const { data } = await api.get("/admin/logs")
    return data
  },
}
