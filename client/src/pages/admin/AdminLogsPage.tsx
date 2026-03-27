import { useEffect, useState } from "react"
import { TerminalSquare, RefreshCcw } from "lucide-react"
import { adminService } from "@/services/adminService"

export function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 20

  const loadLogs = async (page = currentPage) => {
    setLoading(true)
    try {
      const res = await adminService.getLogs(page, limit)
      setLogs(res.data)
      setTotalPages(res.totalPages)
      setTotalItems(res.total)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(currentPage)
  }, [currentPage])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TerminalSquare className="size-6 text-pink-500" />
            Lịch sử thao tác
          </h1>
          <p className="text-sm text-white/40">{totalItems} nhật ký hoạt động</p>
        </div>
        <button
          onClick={() => loadLogs(1)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-white/5 bg-[#1a1a24]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 whitespace-nowrap text-white/60 text-xs">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    <div>{log.admin?.name || "Unknown"}</div>
                    <div className="text-[10px] text-white/40 uppercase mt-0.5">{log.admin?.role || "Hệ thống"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {log.description}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-white/30">
                    Chưa có hoạt động nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </div>
  )
}
