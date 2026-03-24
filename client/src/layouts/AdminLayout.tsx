import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  TerminalSquare,
  Ticket,
  MessageSquare,
  Flower2
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

const NAV_ITEMS = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true, roles: ["admin", "superadmin", "salestaff"] },
  { to: "/admin/products", icon: Package, label: "Sản phẩm", roles: ["admin", "superadmin", "salestaff"] },
  { to: "/admin/orders", icon: ShoppingBag, label: "Đơn hàng", roles: ["admin", "superadmin", "salestaff"] },
  { to: "/admin/users", icon: Users, label: "Người dùng", roles: ["admin", "superadmin"] },
  { to: "/admin/vouchers", icon: Ticket, label: "Khuyến mãi", roles: ["admin", "superadmin"] },
  { to: "/admin/reviews", icon: MessageSquare, label: "Đánh giá", roles: ["admin", "superadmin"] },
  { to: "/admin/logs", icon: TerminalSquare, label: "Lịch sử", roles: ["admin", "superadmin"] },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f14]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/5 bg-[#13131a] transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/25">
            <Flower2 className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Bloom Admin</p>
            <p className="text-xs text-white/40">Control Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-white/40 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/10 text-pink-400 shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-white/5 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-white/40 uppercase">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-white/5 bg-[#13131a]/80 px-4 py-4 backdrop-blur-md lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/50 transition-colors hover:text-white lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400 ring-1 ring-pink-500/20">
              Admin Panel
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
