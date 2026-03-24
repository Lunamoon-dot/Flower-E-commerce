import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { AlertTriangle, Package, ShoppingBag, TrendingUp, Users } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { adminService, type DashboardResponse } from "@/services/adminService"

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
}

// Màu sắc chủ đạo mới
const COLOR_REVENUE = "#a78bfa" // Tím nhạt (Violet 400)
const COLOR_ORDERS = "#fb7185"  // Hồng nhạt (Rose 400)

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  valueColor = "text-white",
}: {
  icon: React.ElementType
  label: string
  value: string
  gradient: string
  valueColor?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a24] p-5">
      <div className={`absolute right-0 top-0 size-28 rounded-full opacity-10 blur-2xl ${gradient}`} />
      <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${gradient}`}>
        <Icon className="size-5 text-white" />
      </div>
      <p className="text-sm text-white/40">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#1e1e2c] p-3 shadow-xl">
        <p className="mb-1 text-xs font-medium text-white/60">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name === "revenue" ? formatCurrency(p.value) : `${p.value} đơn`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AdminDashboardPage() {
  const { user: currentUser } = useAuthStore()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    adminService
      .getDashboard()
      .then(setData)
      .catch(() => setError("Không thể tải dữ liệu dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-red-400">
        {error || "Lỗi tải dữ liệu"}
      </div>
    )
  }

  const { stats, revenueByMonth, revenueByDay, orderStatusData, lowStockProducts } = data

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["admin", "superadmin"].includes(currentUser?.role || "") && (
          <StatCard
            icon={TrendingUp}
            label="Tổng doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            valueColor="text-violet-300"
          />
        )}
        <StatCard
          icon={ShoppingBag}
          label="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString()}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          valueColor="text-pink-300"
        />
        <StatCard
          icon={Package}
          label="Sản phẩm"
          value={stats.totalProducts.toLocaleString()}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        {["admin", "superadmin"].includes(currentUser?.role || "") && (
          <StatCard
            icon={Users}
            label="Người dùng"
            value={stats.totalUsers.toLocaleString()}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        )}
      </div>

      {/* Daily Chart */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-white/5 bg-[#1a1a24] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Doanh thu 14 ngày gần nhất</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_REVENUE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLOR_REVENUE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_ORDERS} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLOR_ORDERS} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fill: COLOR_REVENUE, fontSize: 11, fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(1)}tr`
                    : v >= 1000
                    ? `${(v / 1000).toFixed(0)}k`
                    : v.toLocaleString()
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: COLOR_ORDERS, fontSize: 11, fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke={COLOR_REVENUE}
                strokeWidth={3}
                fill="url(#colorRevenue)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="orders"
                stroke={COLOR_ORDERS}
                strokeWidth={3}
                fill="url(#colorOrders)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a24] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Trạng thái đơn hàng</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={orderStatusData.filter((d) => d.count > 0)}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {orderStatusData
                  .filter((d) => d.count > 0)
                  .map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#888"} />
                  ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]}
                contentStyle={{
                  background: "#1e1e2c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) => STATUS_LABELS[value] || value}
                wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="rounded-2xl border border-white/5 bg-[#1a1a24] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Doanh thu theo tháng (6 tháng gần nhất)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fill: COLOR_REVENUE, fontSize: 11, fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}tr`
                  : v >= 1000
                  ? `${(v / 1000).toFixed(0)}k`
                  : v.toLocaleString()
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              allowDecimals={false}
              tick={{ fill: COLOR_ORDERS, fontSize: 11, fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke={COLOR_REVENUE}
              strokeWidth={3}
              fill="url(#colorRevenue)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke={COLOR_ORDERS}
              strokeWidth={3}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Low stock warning */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-amber-400">
            <AlertTriangle className="size-4" />
            <h2 className="text-sm font-semibold">Sản phẩm sắp hết hàng</h2>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5"
              >
                <span className="text-sm text-white">{p.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    p.stock === 0
                      ? "bg-red-500/20 text-red-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
