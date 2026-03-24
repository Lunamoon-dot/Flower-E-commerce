import { useEffect, useState } from "react"
import { MessageSquare, Star, CheckCircle, XCircle } from "lucide-react"
import { adminService } from "@/services/adminService"
import type { Review } from "@/types"

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const data = await adminService.getReviews()
      setReviews(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

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
              
              <div className="text-sm text-white/80 line-clamp-3 mb-4">{r.comment}</div>
              {r.adminReply && (
                <div className="bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl mb-4 text-xs">
                  <span className="text-pink-400 font-bold block mb-1">Admin:</span>
                  <span className="text-white/80">{r.adminReply}</span>
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
                <button onClick={() => handleReply(r._id)} className="text-xs font-medium text-pink-400 hover:underline">
                  {r.adminReply ? "Sửa phản hồi" : "Phản hồi"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
