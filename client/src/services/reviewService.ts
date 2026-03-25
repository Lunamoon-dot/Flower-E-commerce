import api from "./api"
import type { Review } from "@/types"

export const reviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const { data } = await api.get(`/reviews/product/${productId}`)
    return data
  },
  canReview: async (productId: string): Promise<boolean> => {
    try {
      const { data } = await api.get(`/reviews/can-review/${productId}`)
      return data.canReview
    } catch {
      return false
    }
  },
  createReview: async (productId: string, rating: number, comment: string, orderId?: string): Promise<Review> => {
    const { data } = await api.post("/reviews", { product: productId, rating, comment, orderId })
    return data
  },
  getReviewedProductIds: async (productIds: string[]): Promise<string[]> => {
    try {
      const { data } = await api.post("/reviews/reviewed-products", { productIds })
      return data.reviewedIds ?? []
    } catch {
      return []
    }
  }
}

