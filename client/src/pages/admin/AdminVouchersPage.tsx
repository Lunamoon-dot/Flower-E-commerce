import { useEffect, useState } from "react"
import { Ticket, Plus, Trash2, X, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { adminService } from "@/services/adminService"
import type { Voucher } from "@/types"

const voucherSchema = z.object({
  code: z.string().min(1, "Bắt buộc"),
  type: z.enum(["percent", "fixed", "freeship"]),
  value: z.number().min(0),
  minOrderValue: z.number().min(0),
  startDate: z.string().min(1, "Bắt buộc"),
  endDate: z.string().min(1, "Bắt buộc"),
  usageLimit: z.number().min(1),
})
type FormData = z.infer<typeof voucherSchema>

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
}

export function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: { type: "percent", value: 0, minOrderValue: 0, usageLimit: 10 }
  })

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getVouchers()
      setVouchers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVouchers() }, [])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await adminService.createVoucher(data)
      setToast({ msg: "Thêm thành công", type: "success" })
      setShowModal(false)
      reset()
      fetchVouchers()
    } catch (err: any) {
      setToast({ msg: err.response?.data?.message || "Có lỗi xảy ra", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bác có chắc chắn muốn xoá?")) return
    try {
      await adminService.deleteVoucher(id)
      setVouchers(prev => prev.filter(v => v._id !== id))
      setToast({ msg: "Đã xoá", type: "success" })
    } catch {
      setToast({ msg: "Xoá thất bại", type: "error" })
    }
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check className="size-4" /> : <X className="size-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="size-6 text-pink-500" />
            Voucher Khuyến mãi
          </h1>
          <p className="text-sm text-white/40">Quản lý mã giảm giá trên hệ thống</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-600">
          <Plus className="size-4" /> Thêm mới
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-white/5 bg-[#1a1a24]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/40 uppercase text-xs">
                <th className="px-4 py-3">Mã Code</th>
                <th className="px-4 py-3">Loại / Giá trị</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Sử dụng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {vouchers.map(v => (
                <tr key={v._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono font-bold text-pink-400">{v.code}</td>
                  <td className="px-4 py-3">
                    {v.type === "percent" && `${v.value}%`}
                    {v.type === "fixed" && formatPrice(v.value)}
                    {v.type === "freeship" && `Freeship (max ${formatPrice(v.value)})`}
                    <div className="text-xs text-white/40 mt-1">ĐH tối thiểu: {formatPrice(v.minOrderValue)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">
                    <div>{new Date(v.startDate).toLocaleDateString("vi-VN")}</div>
                    <div>{new Date(v.endDate).toLocaleDateString("vi-VN")}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-semibold text-white">{v.usedCount}</span> / {v.usageLimit}
                  </td>
                  <td className="px-4 py-3">
                    {new Date() > new Date(v.endDate) ? (
                      <span className="text-red-400 border border-red-500/20 px-2 py-1 rounded-full text-xs">Hết hạn</span>
                    ) : v.isActive ? (
                      <span className="text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full text-xs">Đang chạy</span>
                    ) : (
                      <span className="text-white/40 border border-white/10 px-2 py-1 rounded-full text-xs">Đã tắt</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-400/10">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-white/40">Chưa có voucher nào</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#13131a] border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Thêm Voucher Mới</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs text-white/60">Mã Code (Tự viết hoa)</label>
                <input {...register("code")} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1 uppercase" />
                {errors.code && <span className="text-xs text-red-400">{errors.code.message}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60">Loại</label>
                  <select {...register("type")} className="w-full bg-[#1a1a24] border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1">
                    <option value="percent">Giảm phần trăm</option>
                    <option value="fixed">Giảm số tiền</option>
                    <option value="freeship">Miễn phí ship</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60">Giá trị giảm</label>
                  <input type="number" {...register("value", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60">Đơn tối thiểu</label>
                  <input type="number" {...register("minOrderValue", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-white/60">Số lượng</label>
                  <input type="number" {...register("usageLimit", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60">Ngày bắt đầu</label>
                  <input type="date" {...register("startDate")} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-white/60">Ngày kết thúc</label>
                  <input type="date" {...register("endDate")} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 outline-none text-white focus:border-pink-500 mt-1" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-white/60 bg-white/5">Hủy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-white font-semibold bg-pink-500 hover:bg-pink-600 disabled:opacity-50">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
