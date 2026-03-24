import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export function MainLayout() {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${!isHome ? "pt-24" : ""}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
