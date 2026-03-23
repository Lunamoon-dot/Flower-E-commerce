export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  image: string
  images?: string[]
  stock: number
  rating: number
  numReviews: number
  featured?: boolean
  createdAt: string
}

export type ProductCategory =
  | "roses"
  | "tulips"
  | "bouquets"
  | "orchids"
  | "sunflowers"
  | "lilies"
  | "mixed"

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  _id: string
  user: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  totalPrice: number
  status: OrderStatus
  createdAt: string
}

export interface OrderItem {
  product: string
  name: string
  image: string
  price: number
  quantity: number
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  district: string
  note?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  status: number
}

export interface ProductFilters {
  category?: ProductCategory
  search?: string
  featured?: boolean
  sort?: "price_asc" | "price_desc" | "newest" | "rating"
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
