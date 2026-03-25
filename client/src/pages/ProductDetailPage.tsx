import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, ChevronRight, Check, Heart, Share2, ShieldCheck, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/store/useCartStore"
import { formatPrice } from "@/components/ProductCard"
import type { Product } from "@/types"
import { productService } from "@/services/productService"
import { reviewService } from "@/services/reviewService"
import { useAuthStore } from "@/store/useAuthStore"
import type { Review } from "@/types"

const CATEGORY_LABELS: Record<string, string> = {
  roses: "Hoa hồng",
  tulips: "Hoa tulip",
  bouquets: "Bó hoa",
  orchids: "Hoa lan",
  sunflowers: "Hướng dương",
  lilies: "Hoa ly",
  mixed: "Hoa tổng hợp",
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((s) => s.addToCart)
  const { user } = useAuthStore()

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [canUserReview, setCanUserReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(false)
      try {
        const data = await productService.getById(id!)
        setProduct(data)
        
        try {
          const [reviewsData, canReviewStatus] = await Promise.all([
            reviewService.getProductReviews(id!),
            user ? reviewService.canReview(id!) : Promise.resolve(false)
          ])
          setReviews(reviewsData)
          setCanUserReview(canReviewStatus)
        } catch (reviewErr) {
          console.error("Failed to fetch reviews", reviewErr)
          // Lỗi review thì kệ, không sập cả trang
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, user])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) return
    setSubmittingReview(true)
    try {
      const newReview = await reviewService.createReview(id!, reviewRating, reviewComment)
      setReviews([newReview, ...reviews])
      setCanUserReview(false)
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi gửi đánh giá")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-12 lg:grid-cols-2">
          <Skeleton className="aspect-[4/5] rounded-3xl" />
          <div className="space-y-6 pt-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-full bg-muted p-6 text-muted-foreground">
          <ShoppingCart className="size-12 opacity-50" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Không tìm thấy sản phẩm
        </h2>
        <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">
          Sản phẩm này có thể đã bị xoá hoặc hiện không còn tồn tại trong hệ thống.
        </p>
        <Button size="lg" className="mt-8 rounded-full px-8" onClick={() => navigate("/products")}>
          <ChevronLeft className="mr-2 size-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const images = Array.from(new Set([product.image, ...(product.images || [])])).filter(Boolean)

  const nextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center text-sm font-medium text-muted-foreground">
        <Link
          to="/products"
          className="flex items-center transition-colors hover:text-primary"
        >
          <ChevronLeft className="mr-1 size-4" />
          Sản phẩm
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">{CATEGORY_LABELS[product.category] || product.category}</span>
        <span className="mx-2 opacity-50">/</span>
        <span className="truncate max-w-[200px] text-foreground/70">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Gallery Section */}
        <div className="sticky top-24 space-y-3">
          <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="aspect-square w-full bg-muted">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50">
                  <ShoppingCart className="size-20 opacity-20" />
                </div>
              )}
            </div>

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground focus:opacity-100 focus:outline-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground focus:opacity-100 focus:outline-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
                
                {/* Image Counter Badge */}
                <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                    i === selectedImage
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-70 hover:opacity-100 ring-1 ring-border"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {i !== selectedImage && <div className="absolute inset-0 bg-background/10 transition-colors hover:bg-transparent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col pt-2 lg:pt-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Badge variant="outline" className="rounded-full bg-primary/10 px-3 flex items-center text-primary border-primary/20">
              {CATEGORY_LABELS[product.category] || product.category}
            </Badge>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                <Heart className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                <Share2 className="size-5" />
              </Button>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            {product.numReviews > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.round(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({product.numReviews} đánh giá)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="size-4 text-muted" />
                <span>Chưa có đánh giá</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-3xl font-bold tracking-tight text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          <Separator className="my-4 opacity-50" />

          {/* Features */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 p-3 transition-colors hover:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Chất lượng</p>
                <p className="text-xs text-muted-foreground">Hoa tươi 100%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 p-3 transition-colors hover:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Truck className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Giao hàng</p>
                <p className="text-xs text-muted-foreground">Nhanh chóng</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">Tình trạng</span>
              {product.stock > 0 ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                  Còn {product.stock} sản phẩm
                </Badge>
              ) : (
                <Badge variant="destructive" className="font-semibold">Đã hết hàng</Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-semibold text-foreground">Số lượng</span>
              <div className="flex h-9 items-center rounded-full border border-border/60 bg-background shadow-sm">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-10 items-center justify-center rounded-l-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <div className="flex h-full min-w-[2.5rem] items-center justify-center border-x border-border/40 font-semibold text-foreground text-sm">
                  {quantity}
                </div>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-full w-10 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <Button
              size="default"
              className="group h-11 w-full rounded-full text-sm font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {added ? (
                <span className="flex items-center gap-2">
                  <Check className="size-5" />
                  Đã thêm vào giỏ thành công!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="size-5 transition-transform group-hover:-translate-x-1" />
                  Thêm vào giỏ hàng - {formatPrice(product.price * quantity)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Description Box ── */}
      {product.description && (
        <div className="mt-6 w-full">
          <div className="rounded-2xl border border-border/50 bg-card/60 px-5 py-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-0.5 rounded-full bg-primary" />
              <h3 className="text-lg font-bold text-foreground tracking-wide">Giới thiệu sản phẩm</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        </div>
      )}

      {/* ── Reviews Section ── */}
      <div className="mt-14">
        <div className="max-w-4xl mx-auto px-4 lg:px-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Đánh giá sản phẩm
          </h2>
          {reviews.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
              {reviews.length}
            </span>
          )}
        </div>

        {/* Rating Summary + Write Review */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">

          {/* ─ Left: Overall Rating Summary ─ */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-4 shadow-sm">
            {reviews.length > 0 ? (
              <>
                <div className="relative mb-3">
                  <span className="text-4xl font-black tracking-tighter text-foreground leading-none">
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="absolute -right-5 bottom-1 text-base font-semibold text-muted-foreground">/5</span>
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map(s => {
                    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    return (
                      <Star
                        key={s}
                        className={`size-4 ${s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted/40'}`}
                      />
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mb-4">{reviews.length} đánh giá</p>

                {/* Distribution bars */}
                <div className="w-full space-y-2">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground w-3 shrink-0">{star}</span>
                        <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="size-6 fill-muted text-muted/30" />)}
                </div>
                <p className="text-muted-foreground text-sm">Chưa có đánh giá nào</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Hãy là người đầu tiên đánh giá!</p>
              </div>
            )}
          </div>

          {/* ─ Right: Write a Review ─ */}
            {canUserReview ? (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Star className="size-4 text-primary fill-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground">Viết đánh giá của bạn</h3>
              </div>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                {/* Star picker */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                    Chất lượng
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`group relative size-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          star <= reviewRating
                            ? 'bg-amber-400/20 scale-110'
                            : 'bg-muted/50 hover:bg-amber-400/10 hover:scale-105'
                        }`}
                      >
                        <Star className={`size-5 transition-all ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-muted-foreground/40 group-hover:text-amber-400/60'
                        }`} />
                      </button>
                    ))}
                    <span className="ml-2 self-center text-sm font-medium text-muted-foreground">
                      {['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc'][reviewRating]}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                    Nhận xét
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 min-h-[85px] resize-none placeholder:text-muted-foreground/40 transition-all"
                    placeholder="Hoa có tươi không? Giao hàng có nhanh không? Chia sẻ để giúp đỡ người khác..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="w-full h-10 rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100"
                >
                  {submittingReview ? (
                    <span className="flex items-center gap-2">
                      <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Đang gửi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Star className="size-4 fill-current" />
                      Gửi đánh giá
                    </span>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Star className="size-5 text-muted-foreground/40" />
              </div>
              {user ? (
                <>
                  <p className="font-semibold text-foreground">Bạn chưa mua sản phẩm này</p>
                  <p className="text-sm text-muted-foreground max-w-xs">Chỉ khách hàng đã hoàn nhận đơn hàng mới có thể đánh giá sản phẩm.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-foreground">Đăng nhập để đánh giá</p>
                  <p className="text-sm text-muted-foreground">Chia sẻ trải nghiệm của bạn với cộng đồng.</p>
                </>
              )}
            </div>
          )}
          </div>{/* /grid */}


          {/* ─ Review list ─ */}
          <div className="space-y-4 mt-2">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-border/60 bg-muted/10">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="size-7 fill-muted/40 text-muted/40" />)}
                </div>
                <p className="font-semibold text-foreground/60">Chưa có đánh giá nào</p>
                <p className="text-sm text-muted-foreground mt-1">Hãy là người đầu tiên chia sẻ cảm nhận!</p>
              </div>
            ) : (
              reviews.map((r, idx) => (
                <div
                  key={r._id}
                  className="group relative rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-border/80 hover:-translate-y-px overflow-hidden"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Subtle gradient accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="size-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner shrink-0">
                        {r.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground leading-tight">{r.user?.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit", month: "long", year: "numeric"
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stars badge */}
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-2.5 py-1 shrink-0">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`size-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted/30'}`} />
                      ))}
                      <span className="ml-1 text-xs font-bold text-amber-700 dark:text-amber-400">{r.rating}.0</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-foreground/80 leading-relaxed pl-[52px]">{r.comment}</p>

                  {/* Admin reply */}
                  {r.adminReply && (
                    <div className="mt-3 ml-[52px] flex gap-2.5 rounded-xl bg-primary/5 border border-primary/15 p-3.5">
                      <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="size-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary mb-1">BloomShop phản hồi</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.adminReply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>{/* /max-w-4xl */}
      </div>{/* /mt-24 reviews section */}

    </div>
  )
}
