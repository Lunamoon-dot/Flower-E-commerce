import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { Order, OrderStatus } from "@/types"
import { orderService } from "@/services/orderService"
import { formatPrice } from "@/components/ProductCard"

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Đang giao", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  delivered: { label: "Đã giao", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Lịch sử đơn hàng</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = STATUS_MAP[order.status]
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

                <div className="ml-auto flex items-center text-sm text-muted-foreground">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                  <ChevronRight className="ml-1 size-4" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
