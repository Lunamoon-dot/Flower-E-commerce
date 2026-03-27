import { Link } from "react-router-dom"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/components/CartItem"
import { useCartStore } from "@/store/useCartStore"
import { formatPrice } from "@/lib/utils"

export function CartPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCartStore()

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">
          Giỏ hàng trống
        </h2>
        <p className="mt-2 text-muted-foreground">
          Hãy khám phá và thêm những bó hoa yêu thích vào giỏ hàng
        </p>
        <Button className="mt-6" asChild>
          <Link to="/products">Mua sắm ngay</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Giỏ hàng ({totalItems()} sản phẩm)
        </h1>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={clearCart}>
          Xóa tất cả
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border/60 bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Tổng đơn hàng</h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="text-foreground">{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span className="text-foreground">
                  {totalPrice() >= 500000 ? "Miễn phí" : formatPrice(30000)}
                </span>
              </div>
              {totalPrice() < 500000 && (
                <p className="text-xs text-muted-foreground">
                  Mua thêm {formatPrice(500000 - totalPrice())} để được miễn phí giao hàng
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Tổng cộng</span>
              <span className="text-primary">
                {formatPrice(
                  totalPrice() + (totalPrice() >= 500000 ? 0 : 30000)
                )}
              </span>
            </div>

            <Button className="mt-6 w-full" size="lg" asChild>
              <Link to="/checkout">
                Tiến hành đặt hàng
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>

            <Button variant="outline" className="mt-2 w-full" asChild>
              <Link to="/products">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
