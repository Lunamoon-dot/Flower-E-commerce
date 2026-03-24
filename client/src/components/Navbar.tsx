import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Menu, X, Search, LogOut, Package, Flower2, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useCartStore } from "@/store/useCartStore"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const totalItems = useCartStore((s) => s.totalItems)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/products", label: "Sản phẩm" },
    { to: "/products?category=roses", label: "Hoa hồng" },
    { to: "/products?category=bouquets", label: "Bó hoa" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none pt-4 px-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between pointer-events-auto">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-shadow ring-2 ring-white/20">
            <Flower2 className="size-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-white drop-shadow-md sm:block">
            Bloom<span className="text-pink-500">Shop</span>
          </span>
        </Link>

        {/* Middle: Navigation Pill - Màu hồng tươi thuần khiết, không pha xám */}
        <nav className="hidden items-center gap-1 rounded-full border border-pink-400/50 bg-pink-500/25 px-2 py-1.5 backdrop-blur-2xl md:flex shadow-[0_8px_32px_rgba(236,72,153,0.25)]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-1.5 text-sm font-bold text-white transition-all hover:bg-pink-600/40 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions Pill - Hồng thuần khiết */}
        <div className="flex items-center gap-2 rounded-full border border-pink-400/50 bg-pink-500/25 p-1.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(236,72,153,0.25)]">
          <button
            onClick={() => navigate("/products")}
            className="flex size-9 items-center justify-center rounded-full text-white transition-all hover:bg-pink-600/40"
          >
            <Search className="size-[18px]" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="relative flex size-9 items-center justify-center rounded-full text-white transition-all hover:bg-pink-600/40"
          >
            <ShoppingCart className="size-[18px]" strokeWidth={2.5} />
            {totalItems() > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xl ring-2 ring-pink-300">
                {totalItems()}
              </span>
            )}
          </button>

          <div className="mx-1 h-4 w-px bg-pink-300/40 hidden md:block" />

          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              {["admin", "superadmin", "salestaff"].includes(user.role) && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex size-8 items-center justify-center rounded-full text-pink-600 transition-all hover:bg-pink-600/40"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="size-[18px]" strokeWidth={2.5} />
                </button>
              )}
              <button
                onClick={() => navigate("/orders")}
                className="flex size-8 items-center justify-center rounded-full text-white transition-all hover:bg-pink-600/40"
                title="Đơn hàng"
              >
                <Package className="size-[18px]" strokeWidth={2.5} />
              </button>
              <button
                onClick={handleLogout}
                className="flex size-8 items-center justify-center rounded-full text-white transition-all hover:bg-rose-600/40 hover:text-rose-100"
                title="Đăng xuất"
              >
                <LogOut className="size-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden h-8 items-center rounded-full px-5 text-sm font-bold text-white transition-all bg-pink-500/40 border border-pink-300/50 hover:bg-pink-500/60 md:flex shadow-lg shadow-pink-500/20"
            >
              Đăng nhập
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            className="flex size-9 items-center justify-center rounded-full text-white transition-all hover:bg-pink-600/40 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" strokeWidth={2.5} /> : <Menu className="size-5" strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute left-4 right-4 mt-3 overflow-hidden rounded-3xl border border-pink-400/50 bg-pink-600/90 p-3 backdrop-blur-3xl md:hidden pointer-events-auto shadow-2xl">
          <div className="flex flex-col gap-1 text-white">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-5 py-4 text-sm font-bold transition-all hover:bg-white/20 active:bg-white/30"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/20 mx-2" />
            {user ? (
              <div className="space-y-1">
                {["admin", "superadmin", "salestaff"].includes(user.role) && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-pink-700 transition-all hover:bg-white/20"
                  >
                    <LayoutDashboard className="size-5" strokeWidth={2.5} /> Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all hover:bg-white/20"
                >
                  <Package className="size-5" strokeWidth={2.5} /> Đơn hàng
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-rose-100 transition-all hover:bg-rose-700/40"
                >
                  <LogOut className="size-5" strokeWidth={2.5} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                <button
                  onClick={() => { navigate("/login"); setMobileOpen(false) }}
                  className="rounded-2xl border border-white/30 bg-white/10 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => { navigate("/register"); setMobileOpen(false) }}
                  className="rounded-2xl bg-white py-3.5 text-sm font-bold text-pink-600 shadow-lg active:scale-95 transition-all"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
