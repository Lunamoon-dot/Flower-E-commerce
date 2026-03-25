import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Package, ChevronRight, Star, X, Send, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { Order, OrderStatus } from "@/types"
import { orderService } from "@/services/orderService"
import { reviewService } from "@/services/reviewService"
import { formatPrice } from "@/components/ProductCard"

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Đang giao", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  delivered: { label: "Đã giao", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

interface ReviewItem {
  productId: string
  name: string
  image: string
  rating: number
  comment: string
  submitted: boolean
  submitting: boolean
  alreadyReviewed: boolean
}

interface ReviewModalProps {
  order: Order
  onClose: () => void
}

function ReviewModal({ order, onClose }: ReviewModalProps) {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const productIds = order.items.map(i => i.product as string)
    reviewService.getReviewedProductIds(productIds).then(reviewedIds => {
      setItems(
        order.items.map(i => ({
          productId: i.product as string,
          name: i.name,
          image: i.image,
          rating: 5,
          comment: "",
          submitted: false,
          submitting: false,
          alreadyReviewed: reviewedIds.includes(i.product as string),
        }))
      )
      setLoadingStatus(false)
    })
  }, [order])

  const setRating = (idx: number, rating: number) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, rating } : it))
  }
  const setComment = (idx: number, comment: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, comment } : it))
  }

  const submitReview = async (idx: number) => {
    const item = items[idx]
    if (!item.comment.trim() || item.submitting || item.submitted || item.alreadyReviewed) return
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, submitting: true } : it))
    try {
      await reviewService.createReview(item.productId, item.rating, item.comment, order._id)
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, submitting: false, submitted: true } : it))
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Lỗi khi gửi đánh giá"
      alert(msg)
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, submitting: false } : it))
    }
  }

  const allDone = items.every(it => it.submitted || it.alreadyReviewed)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/60 bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border/40 bg-background/95 backdrop-blur-sm px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Đánh giá đơn hàng</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              #{order._id.slice(-6).toUpperCase()} · {order.items.length} sản phẩm
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {loadingStatus ? (
            <div className="space-y-4">
              {order.items.map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.productId}
                className={`rounded-xl border p-4 transition-all ${
                  item.submitted || item.alreadyReviewed
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-900/10"
                    : "border-border/60 bg-card"
                }`}
              >
                {/* Product header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border/60">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                    {(item.submitted || item.alreadyReviewed) && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        <CheckCircle2 className="size-3" />
                        {item.alreadyReviewed && !item.submitted ? "Đã đánh giá trước đó" : "Đã gửi đánh giá"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review form */}
                {!item.submitted && !item.alreadyReviewed && (
                  <div className="space-y-3">
                    {/* Star rating */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Đánh giá của bạn</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(idx, star)}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              className={`size-7 transition-colors ${
                                star <= item.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nhận xét</label>
                      <textarea
                        value={item.comment}
                        onChange={e => setComment(idx, e.target.value)}
                        placeholder="Chia sẻ cảm nhận về sản phẩm này..."
                        className="w-full bg-background border border-border/60 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] placeholder:text-muted-foreground/50"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => submitReview(idx)}
                      disabled={!item.comment.trim() || item.submitting}
                      className="w-full gap-2"
                    >
                      <Send className="size-3.5" />
                      {item.submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                  </div>
                )}

                {/* Already reviewed display */}
                {(item.submitted || item.alreadyReviewed) && item.submitted && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`size-5 ${star <= item.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted/30"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur-sm px-6 py-4">
          {allDone && !loadingStatus ? (
            <Button className="w-full gap-2" onClick={onClose}>
              <CheckCircle2 className="size-4" />
              Hoàn thành — Cảm ơn bạn đã đánh giá!
            </Button>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Đánh giá giúp chúng tôi cải thiện chất lượng dịch vụ
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getUserOrders()
        setOrders(data)
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Package className="size-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">
          Chưa có đơn hàng
        </h2>
        <p className="mt-2 text-muted-foreground">
          Hãy đặt đơn hàng đầu tiên của bạn
        </p>
        <Button className="mt-6" asChild>
          <Link to="/products">Mua sắm ngay</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Lịch sử đơn hàng</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status]
            const isDelivered = order.status === "delivered"
            return (
              <div
                key={order._id}
                className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div
                      key={i}
                      className="size-12 shrink-0 overflow-hidden rounded-lg border border-border/60"
                    >
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-sm text-muted-foreground">
                      +{order.items.length - 4} sản phẩm khác
                    </span>
                  )}

                  <div className="ml-auto flex items-center gap-3">
                    {isDelivered && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60 transition-all"
                        onClick={() => setReviewingOrder(order)}
                      >
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        Đánh giá
                      </Button>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                      <ChevronRight className="ml-1 size-4" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
        />
      )}
    </>
  )
}
