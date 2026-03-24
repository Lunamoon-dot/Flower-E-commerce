import { useEffect, useState } from "react"
import { Search, Trash2, X, Check } from "lucide-react"
import { adminService, type AdminUser } from "@/services/adminService"
import { useAuthStore } from "@/store/useAuthStore"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    adminService
      .getUsers()
      .then(setUsers)
      .catch(() => showToast("Không thể tải danh sách người dùng", "error"))
      .finally(() => setLoading(false))
  }, [])

  const handleChangeRole = async (user: AdminUser, newRole: string) => {
    if (user._id === currentUser?.id) {
      showToast("Không thể đổi role của chính mình", "error")
      return
    }
    try {
      const updated = await adminService.updateUserRole(user._id, newRole as any)
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      showToast(`Đã đổi role thành ${newRole.toUpperCase()}`)
    } catch {
      showToast("Cập nhật thất bại", "error")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
      showToast("Đã xóa người dùng")
    } catch {
      showToast("Xóa thất bại", "error")
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const supersCount = users.filter((u) => u.role === "superadmin").length
  const adminCount = users.filter((u) => u.role === "admin").length
  const salesCount = users.filter((u) => u.role === "salestaff").length
  const userCount = users.filter((u) => u.role === "user").length

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Người dùng</h1>
          <p className="text-sm text-white/40">{users.length} người dùng</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400 ring-1 ring-pink-500/20">
            {supersCount} Super
          </span>
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/20">
            {adminCount} Admin
          </span>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            {salesCount} Sale
          </span>
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20">
            {userCount} User
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm người dùng..."
          className="w-full rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-2xl border border-white/5 bg-[#1a1a24]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Người dùng", "Email", "Vai trò", "Ngày tạo", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-xs font-bold text-white">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        {u._id === currentUser?.id && (
                          <p className="text-xs text-pink-400">Bạn</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] uppercase font-semibold ring-1 ${
                        u.role === "superadmin"
                          ? "bg-pink-500/10 text-pink-400 ring-pink-500/20"
                          : u.role === "admin"
                          ? "bg-purple-500/10 text-purple-400 ring-purple-500/20"
                          : u.role === "salestaff"
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                          : "bg-white/5 text-white/50 ring-white/10"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        disabled={u._id === currentUser?.id}
                        className="rounded-lg bg-[#252533] px-2 py-1 text-xs font-medium text-white border border-white/10 outline-none focus:border-pink-500"
                      >
                        <option value="user">User</option>
                        <option value="salestaff">Sale Staff</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                      {u._id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteId(u._id)}
                          className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/30">
                    Không tìm thấy người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a24] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Xóa người dùng?</h3>
            <p className="mt-2 text-sm text-white/50">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
