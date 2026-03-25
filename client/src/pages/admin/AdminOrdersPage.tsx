import { useEffect, useState } from "react"
import { Search, ChevronDown, X, Check } from "lucide-react"
import { adminService } from "@/services/adminService"
import type { Order, OrderStatus } from "@/types"

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  shipped: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 ring-red-500/20",
}

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"]

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all")
  const [filterDelivery, setFilterDelivery] = useState<"all" | "today" | "tomorrow">("all")
  const [sortBy, setSortBy] = useState<"createdAt" | "deliveryDate">("createdAt")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    adminService
      .getOrders()
      .then(setOrders)
      .catch(() => showToast("Không thể tải đơn hàng", "error"))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await adminService.updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)))
      if (selectedOrder?._id === orderId) setSelectedOrder(updated)
      showToast("Cập nhật trạng thái thành công!")
    } catch {
      showToast("Cập nhật thất bại", "error")
    }
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus
    const cleanSearch = search.startsWith("#") ? search.slice(1).toLowerCase() : search.toLowerCase()
    
    const matchSearch =
      o._id.toLowerCase().includes(cleanSearch) ||
      (typeof o.user === "object" && (o.user as any)?.name?.toLowerCase().includes(cleanSearch))
      
    let matchDelivery = true
    if (filterDelivery !== "all" && o.deliveryDate) {
      const delivery = new Date(o.deliveryDate)
      // Reset hours to compare dates only
      delivery.setHours(0,0,0,0)
      
      const targetDate = new Date()
      if (filterDelivery === "tomorrow") {
        targetDate.setDate(targetDate.getDate() + 1)
      }
      targetDate.setHours(0,0,0,0)
      
      matchDelivery = delivery.getTime() === targetDate.getTime()
    } else if (filterDelivery !== "all" && !o.deliveryDate) {
      matchDelivery = false // no delivery date -> doesn't match a specific day filter
    }

    return matchStatus && matchSearch && matchDelivery
  }).sort((a, b) => {
    if (sortBy === "deliveryDate") {
      const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0
      const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0
      return dateA - dateB // Closest first
    }
    // Default: createdAt desc
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <Check className="size-4" /> : <X className="size-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
        <p className="text-sm text-white/40">{orders.length} đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm đơn hàng..."
            className="w-full rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "all")}
            className="appearance-none rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-pink-500/50"
          >
            <option value="all">Tất cả</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
        </div>
        <div className="relative">
          <select
            value={filterDelivery}
            onChange={(e) => setFilterDelivery(e.target.value as "all" | "today" | "tomorrow")}
            className="appearance-none rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-pink-500/50"
          >
            <option value="all">Mọi ngày giao</option>
            <option value="today">Giao Hôm nay</option>
            <option value="tomorrow">Giao Ngày mai</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "createdAt" | "deliveryDate")}
            className="appearance-none rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-4 pr-9 text-sm text-white outline-none focus:border-pink-500/50"
          >
            <option value="createdAt">Mới nhất (Ngày đặt)</option>
            <option value="deliveryDate">Sắp giao (Ngày giao)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-2xl border border-white/5 bg-[#1a1a24]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Mã đơn", "Khách hàng", "Giao hàng", "Tổng tiền", "Trạng thái", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((o) => (
                <tr key={o._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-white/50">
                    #{o._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {typeof o.user === "object" ? (o.user as any)?.name : "—"}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {o.deliveryDate ? (
                      <div className="flex flex-col">
                        <span className="text-sm">{new Date(o.deliveryDate).toLocaleDateString("vi-VN")}</span>
                        <span className="text-xs text-white/50">{o.deliveryTime}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-white/50">{formatDate(o.createdAt)} (Đặt)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{formatPrice(o.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value as OrderStatus)}
                        className={`appearance-none rounded-full py-1 pl-3 pr-6 text-xs font-semibold ring-1 cursor-pointer outline-none ${STATUS_COLORS[o.status]}`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/30">
                    Không có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1a24] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h3 className="text-lg font-bold text-white">
                Chi tiết đơn #{selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Shipping address */}
              <div className="rounded-xl bg-white/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-white/40">Địa chỉ giao hàng</p>
                <p className="text-sm text-white">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-sm text-white/60">{selectedOrder.shippingAddress.phone}</p>
                <p className="text-sm text-white/60">
                  {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.district},{" "}
                  {selectedOrder.shippingAddress.city}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-white/40">Giao hàng lúc</p>
                {selectedOrder.deliveryDate && selectedOrder.deliveryTime ? (
                  <>
                    <p className="text-sm text-white">Ngày: {new Date(selectedOrder.deliveryDate).toLocaleDateString("vi-VN")}</p>
                    <p className="text-sm text-white/60">Khung giờ: {selectedOrder.deliveryTime}</p>
                  </>
                ) : (
                  <p className="text-sm text-white/60">Giao tiêu chuẩn</p>
                )}
                {selectedOrder.shippingAddress.note && (
                  <p className="mt-2 text-sm text-amber-300">Ghi chú: {selectedOrder.shippingAddress.note}</p>
                )}
              </div>
              {/* Items */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-white/40">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-white/40">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-pink-500/10 px-4 py-3">
                <span className="text-sm font-semibold text-white">Tổng cộng</span>
                <span className="font-bold text-pink-400">{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
