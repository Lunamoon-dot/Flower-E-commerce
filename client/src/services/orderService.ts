import type { Order, ShippingAddress } from "@/types"
import api from "./api"

interface CreateOrderPayload {
  items: { product: string; quantity: number }[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  deliveryDate: string
  deliveryTime: string
  voucherCode?: string
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post("/orders", payload)
    return data
  },

  async getUserOrders(): Promise<Order[]> {
    const { data } = await api.get("/orders/user")
    return data
  },

  async getById(id: string): Promise<Order> {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },
}
