import { useEffect, useState } from "react"
import { TerminalSquare, RefreshCcw, Calendar, X } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { adminService } from "@/services/adminService"

export function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 7

  const [filterDate, setFilterDate] = useState("")

  const loadLogs = async (page = currentPage, date = filterDate) => {
    setLoading(true)
    try {
      const res = await adminService.getLogs(page, limit, date || undefined)
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
    loadLogs(currentPage, filterDate)
  }, [currentPage])

  const handleDateChange = (date: string) => {
    setFilterDate(date)
    setCurrentPage(1)
    loadLogs(1, date)
  }

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
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-[160px] cursor-pointer rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-9 pr-8 text-sm text-white outline-none focus:border-pink-500/50 [color-scheme:dark]"
            />
            {filterDate && (
              <button
                onClick={() => handleDateChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => loadLogs(1, filterDate)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
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
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    </div>
  )
}
