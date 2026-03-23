import { Link } from "react-router-dom"
import { Flower2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Flower2 className="size-16 text-primary/30" strokeWidth={1} />
      <h1 className="mt-6 text-6xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Trang bạn tìm kiếm không tồn tại
      </p>
      <Button className="mt-8" asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  )
}
