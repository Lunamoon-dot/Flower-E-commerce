import { useEffect, useState } from "react"
import { MessageSquare, Star, CheckCircle, XCircle } from "lucide-react"
import { adminService } from "@/services/adminService"
import type { Order } from "@/types"
import { stripTags } from "@/lib/utils"

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [fetchingOrder, setFetchingOrder] = useState(false)

  const fetchReviews = async (page = currentPage) => {
    setLoading(true)
    try {
      const res = await adminService.getReviews(page, limit)
      setReviews(res.data)
      setTotalPages(res.totalPages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews(currentPage) }, [currentPage])

  const handleUpdate = async (id: string, isApproved: boolean, isHidden: boolean) => {
    try {
      const updated = await adminService.updateReview(id, { isApproved, isHidden })
      setReviews(prev => prev.map(r => r._id === id ? updated : r))
    } catch {
      alert("Lỗi khi cập nhật")
    }
  }

  const handleReply = async (id: string) => {
    const reply = prompt("Nhập câu trả lời của bạn: ")
    if (!reply) return
    try {
      const updated = await adminService.updateReview(id, { adminReply: reply })
      setReviews(prev => prev.map(r => r._id === id ? updated : r))
    } catch {
      alert("Lỗi")
    }
  }

  const handleViewOrder = async (id: string) => {
    setFetchingOrder(true)
    setOrderModalOpen(true)
    try {
      const order = await adminService.getReviewOrder(id)
      setSelectedOrder(order)
    } catch {
      alert("Không tìm thấy đơn hàng tương ứng")
      setOrderModalOpen(false)
    } finally {
      setFetchingOrder(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="size-6 text-pink-500" />
          Đánh giá sản phẩm
        </h1>
        <p className="text-sm text-white/40">Duyệt hoặc ẩn bình luận của khách hàng</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           <div className="text-white/40 col-span-3">Đang tải...</div>
        ) : reviews.length === 0 ? (
           <div className="text-white/40 col-span-3">Chưa có đánh giá nào</div>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="bg-[#1a1a24] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold font-mono">
                    {r.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white leading-tight">{r.user?.name}</div>
                    <div className="text-xs text-white/40">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex px-2 py-1 bg-white/5 rounded-full items-center gap-1">
                  <Star className="size-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-white">{r.rating}</span>
                </div>
              </div>
              
              <div className="text-sm text-white/80 line-clamp-3 mb-4">{stripTags(r.comment)}</div>
              {r.adminReply && (
                <div className="bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl mb-4 text-xs">
                  <span className="text-pink-400 font-bold block mb-1">Admin:</span>
                  <span className="text-white/80">{stripTags(r.adminReply)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                <div className="flex gap-2 text-xs">
                  {!r.isApproved ? (
                    <button onClick={() => handleUpdate(r._id, true, r.isHidden)} className="flex items-center gap-1 text-emerald-400 hover:bg-emerald-400/10 px-2 py-1 rounded">
                      <CheckCircle className="size-3" /> Duyệt
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400/50 px-2 py-1"><CheckCircle className="size-3" /> Đã duyệt</span>
                  )}

                  {!r.isHidden ? (
                    <button onClick={() => handleUpdate(r._id, r.isApproved, true)} className="flex items-center gap-1 text-red-400 hover:bg-red-400/10 px-2 py-1 rounded">
                      <XCircle className="size-3" /> Ẩn
                    </button>
                  ) : (
                    <button onClick={() => handleUpdate(r._id, r.isApproved, false)} className="flex items-center gap-1 text-white/40 hover:bg-white/10 px-2 py-1 rounded">
                      Đang ẩn
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleViewOrder(r._id)} className="text-xs font-medium text-blue-400 hover:underline">
                    Chi tiết đơn
                  </button>
                  <button onClick={() => handleReply(r._id)} className="text-xs font-medium text-pink-400 hover:underline">
                    {r.adminReply ? "Sửa phản hồi" : "Phản hồi"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-xs text-white/40">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/5 disabled:opacity-30"
            >
              Trước
            </button>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/5 disabled:opacity-30"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
            <button 
              onClick={() => { setOrderModalOpen(false); setSelectedOrder(null) }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <XCircle className="size-6" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Chi tiết đặt đơn</h2>
            {fetchingOrder ? (
              <div className="text-white/40 py-8 text-center">Đang tải thông tin đơn hàng...</div>
            ) : selectedOrder ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Mã đơn:</span>
                    <span className="text-white font-mono">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Ngày đặt:</span>
                    <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Ngày nhận:</span>
                    <span className="text-white">{new Date(selectedOrder.deliveryDate).toLocaleDateString()} {selectedOrder.deliveryTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Thanh toán:</span>
                    <span className="text-white uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm text-pink-400 font-bold border-t border-white/10 pt-2 mt-2">
                    <span>Tổng tiền:</span>
                    <span>{selectedOrder.totalPrice.toLocaleString()}đ</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Sản phẩm đã mua:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-white/5 rounded-lg p-2 items-center">
                        <img src={item.image} alt={item.name} className="size-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate font-medium">{item.name}</div>
                          <div className="text-xs text-white/40">{item.price.toLocaleString()}đ x {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 py-8 text-center text-sm">Lỗi không tải được đơn hàng</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
