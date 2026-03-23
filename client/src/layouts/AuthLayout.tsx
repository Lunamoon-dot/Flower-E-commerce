import { Outlet, Link } from "react-router-dom"
import { Flower2 } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary/90 to-primary lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="mx-auto max-w-sm text-center text-primary-foreground">
          <Flower2 className="mx-auto size-16 mb-6" strokeWidth={1.2} />
          <h2 className="text-3xl font-bold">BloomShop</h2>
          <p className="mt-3 text-lg text-primary-foreground/80">
            Gửi yêu thương qua từng cánh hoa tươi thắm
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <Link to="/" className="mb-8 flex items-center gap-2 text-primary lg:hidden">
          <Flower2 className="size-8" strokeWidth={1.5} />
          <span className="text-2xl font-bold">BloomShop</span>
        </Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
