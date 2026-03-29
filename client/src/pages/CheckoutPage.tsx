import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, CreditCard, Banknote, Loader2, TicketPercent, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { formatPrice } from "@/lib/utils"
import { orderService } from "@/services/orderService"
import { voucherService } from "@/services/voucherService"
import type { Voucher } from "@/types"

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  address: z.string().min(5, "Vui lòng nhập địa chỉ"),
  city: z.string().min(2, "Vui lòng nhập thành phố"),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  note: z.string().optional(),
  deliveryDate: z.string().min(1, "Vui lòng chọn ngày giao hàng"),
  deliveryTime: z.string().min(1, "Vui lòng chọn khung giờ giao hàng"),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, totalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [submitting, setSubmitting] = useState(false)
  const [voucherCode, setVoucherCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [voucherError, setVoucherError] = useState("")
  const [voucherSuccess, setVoucherSuccess] = useState("")
  const [activeVouchers, setActiveVouchers] = useState<Voucher[]>([])

  useEffect(() => {
    voucherService.getActiveVouchers()
      .then(setActiveVouchers)
      .catch(console.error)
  }, [])

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
  const subTotal = totalPrice() + shippingFee
  const total = Math.max(0, subTotal - discountAmount)

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true)
    try {
      await orderService.create({
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          district: data.district,
          note: data.note,
        },
        paymentMethod,
        deliveryDate: data.deliveryDate,
        deliveryTime: data.deliveryTime,
        voucherCode: voucherSuccess ? voucherCode : undefined
      })
      clearCart()
      navigate("/orders")
    } catch {
      alert("Đặt hàng thất bại. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const applyVoucherCode = async (code: string) => {
    if (!code.trim()) return
    setVoucherCode(code)
    setVoucherError("")
    setVoucherSuccess("")
    try {
      const res = await voucherService.validateVoucher(code, totalPrice())
      setDiscountAmount(res.discountAmount)
      setVoucherSuccess("Áp dụng mã thành công!")
      if (res.voucher.type === "freeship") {
        setDiscountAmount(shippingFee) // simple freeship logic
      }
    } catch (err: any) {
      setDiscountAmount(0)
      setVoucherError(err.response?.data?.message || "Mã không hợp lệ")
    }
  }

  const handleApplyVoucher = () => applyVoucherCode(voucherCode)

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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Ngày giao hàng
                  </label>
                  <Input type="date" {...register("deliveryDate")} />
                  {errors.deliveryDate && (
                    <p className="mt-1 text-xs text-destructive">{errors.deliveryDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Khung giờ giao hàng
                  </label>
                  <select
                    {...register("deliveryTime")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Chọn khung giờ</option>
                    <option value="08:00 - 10:00">08:00 - 10:00</option>
                    <option value="10:00 - 12:00">10:00 - 12:00</option>
                    <option value="12:00 - 14:00">12:00 - 14:00</option>
                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                    <option value="16:00 - 18:00">16:00 - 18:00</option>
                    <option value="18:00 - 20:00">18:00 - 20:00</option>
                  </select>
                  {errors.deliveryTime && (
                    <p className="mt-1 text-xs text-destructive">{errors.deliveryTime.message}</p>
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

            {/* Voucher Section */}
            {/* Voucher Section - Beautiful Ticket Design */}
            <div className="rounded-2xl border border-pink-500/10 bg-gradient-to-br from-card to-pink-50/50 dark:to-pink-950/10 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex size-8 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400">
                  <TicketPercent className="size-4" strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-bold text-foreground">Mã ưu đãi (Voucher)</h2>
              </div>
              
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Nhập mã voucher tại đây..." 
                    value={voucherCode} 
                    onChange={e => setVoucherCode(e.target.value)}
                    className="h-12 rounded-xl border-border/60 bg-background/80 pr-10 uppercase transition-all focus-visible:ring-pink-500/30"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleApplyVoucher} 
                  className="h-12 w-[100px] rounded-xl font-bold bg-foreground hover:bg-foreground/90 text-background shadow-md"
                >
                  Áp dụng
                </Button>
              </div>

              {voucherError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">!</span>
                  {voucherError}
                </div>
              )}
              {voucherSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
                  {voucherSuccess}
                </div>
              )}
              
              {activeVouchers.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/60" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Voucher có sẵn</p>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>
                  
                  <div className="grid gap-4 max-h-[380px] overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50 hover:scrollbar-thumb-border/80">
                    {activeVouchers.map(v => {
                      const isEligible = totalPrice() >= v.minOrderValue;
                      const isSelected = voucherCode === v.code && discountAmount > 0;
                      
                      return (
                        <div 
                          key={v._id} 
                          className={`group relative flex overflow-hidden rounded-xl border transition-all duration-300 ${
                            isEligible 
                              ? isSelected 
                                ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-500/5 ring-1 ring-pink-500/20 shadow-md shadow-pink-500/10 scale-[1.01]' 
                                : 'border-border/60 bg-card hover:border-pink-300 dark:hover:border-pink-500/40 hover:shadow-md hover:-translate-y-0.5' 
                              : 'bg-muted/40 border-border/40 opacity-75 grayscale-[0.5]'
                          }`}
                        >
                          {/* Left Decorative Section (Ticket Stub) */}
                          <div className={`relative flex w-24 shrink-0 flex-col items-center justify-center bg-gradient-to-br p-3 text-center border-r border-dashed ${
                            isEligible
                              ? isSelected
                                ? 'from-pink-500 to-rose-600 text-white border-pink-500/30'
                                : 'from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 border-border/80 text-pink-700 dark:text-pink-300 group-hover:from-pink-100 group-hover:to-pink-200 dark:group-hover:from-pink-800/40 dark:group-hover:to-pink-700/30'
                              : 'from-muted to-muted border-border/40 text-muted-foreground'
                          }`}>
                            {/* Decorative Cutouts */}
                            <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-background border-r border-background shadow-[1px_0_0_rgba(0,0,0,0.05)]" />
                            <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-background border-l border-background shadow-[-1px_0_0_rgba(0,0,0,0.05)]" />

                            <TicketPercent className={`size-6 mb-1 opacity-80 ${isSelected && isEligible ? 'text-white' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                              {v.type === 'freeship' ? 'Freeship' : v.type === 'percent' ? `Giảm ${v.value}%` : `Giảm ${formatPrice(v.value).replace('₫', '')}`}
                            </span>
                          </div>

                          {/* Right Content Section */}
                          <div className="flex flex-1 flex-col justify-center p-4 pl-5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className={`font-black text-sm uppercase tracking-wider mb-1 ${
                                  isSelected ? 'text-pink-600 dark:text-pink-400' : 'text-foreground'
                                }`}>
                                  {v.code}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {v.type === 'freeship' 
                                    ? 'Miễn phí vận chuyển cho đơn hàng' 
                                    : v.type === 'percent' 
                                      ? `Giảm ${v.value}% cho tổng giá trị đơn hàng` 
                                      : `Giảm ${formatPrice(v.value)} trực tiếp vào tổng tiền`
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                              <div className="rounded-md bg-muted/50 px-2 py-1 border border-border/50 inline-flex items-center gap-1">
                                <span className="text-[10px] font-medium text-muted-foreground">Đơn tối thiểu:</span>
                                <span className="text-xs font-bold text-foreground">
                                  {formatPrice(v.minOrderValue)}
                                </span>
                              </div>
                              
                              {isEligible ? (
                                <Button 
                                  type="button"
                                  size="sm" 
                                  className={`h-7 px-4 text-xs font-bold rounded-full transition-all ${
                                    isSelected 
                                      ? "bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20" 
                                      : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                                  }`}
                                  onClick={() => applyVoucherCode(v.code)}
                                >
                                  {isSelected ? (
                                    <span className="flex items-center gap-1.5">
                                      <CheckCircle2 className="size-3.5" />
                                      Đã chọn
                                    </span>
                                  ) : "Áp dụng"}
                                </Button>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                                    Còn thiếu {formatPrice(v.minOrderValue - totalPrice())}
                                  </span>
                                  <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-muted">
                                    <div 
                                      className="h-full bg-rose-400 rounded-full" 
                                      style={{ width: `${Math.min(100, (totalPrice() / v.minOrderValue) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-500 font-medium">Khuyến mãi</span>
                    <span className="text-emerald-500 font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
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
