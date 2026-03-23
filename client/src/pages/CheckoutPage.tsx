import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, CreditCard, Banknote, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { formatPrice } from "@/components/ProductCard"
import { orderService } from "@/services/orderService"

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  address: z.string().min(5, "Vui lòng nhập địa chỉ"),
  city: z.string().min(2, "Vui lòng nhập thành phố"),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  note: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, totalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  })

  if (cart.length === 0) {
    navigate("/cart")
    return null
  }

  const shippingFee = totalPrice() >= 500000 ? 0 : 30000
  const total = totalPrice() + shippingFee

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true)
    try {
      await orderService.create({
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: data,
        paymentMethod,
      })
      clearCart()
      navigate("/orders")
    } catch {
      alert("Đặt hàng thất bại. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Quay lại giỏ hàng
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-foreground">Thanh toán</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Thông tin giao hàng
              </h2>

              {!user && (
                <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Đăng nhập
                  </Link>{" "}
                  để lưu thông tin cho lần mua sau
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Họ và tên
                  </label>
                  <Input {...register("fullName")} placeholder="Nguyễn Văn A" />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Số điện thoại
                  </label>
                  <Input {...register("phone")} placeholder="0900 123 456" />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Thành phố
                  </label>
                  <Input {...register("city")} placeholder="TP. Hồ Chí Minh" />
                  {errors.city && (
                    <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Quận / Huyện
                  </label>
                  <Input {...register("district")} placeholder="Quận 1" />
                  {errors.district && (
                    <p className="mt-1 text-xs text-destructive">{errors.district.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Địa chỉ chi tiết
                  </label>
                  <Input {...register("address")} placeholder="123 Nguyễn Huệ, Phường Bến Nghé" />
                  {errors.address && (
                    <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <Input {...register("note")} placeholder="Giao giờ hành chính, gọi trước 30 phút..." />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-primary"
                  />
                  <Banknote className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-primary"
                  />
                  <CreditCard className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Thẻ tín dụng / Ghi nợ</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, JCB</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border/60 bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Đơn hàng của bạn</h2>

              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí giao hàng</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              <Button type="submit" className="mt-6 w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  `Đặt hàng - ${formatPrice(total)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
