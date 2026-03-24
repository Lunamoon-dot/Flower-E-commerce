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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center text-sm font-medium text-muted-foreground">
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

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Gallery Section */}
        <div className="sticky top-24 space-y-6">
          <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="aspect-[4/5] w-full bg-muted sm:aspect-square lg:aspect-[4/5]">
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
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
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
        <div className="flex flex-col pt-2 lg:pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-4">
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

          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-4xl font-bold tracking-tight text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground text-base">
            {product.description}
          </p>

          <Separator className="my-8 opacity-50" />

          {/* Features */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Chất lượng</p>
                <p className="text-xs text-muted-foreground">Hoa tươi 100%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Truck className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Giao hàng</p>
                <p className="text-xs text-muted-foreground">Nhanh chóng</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 rounded-2xl bg-muted/30 p-6 border border-border/50">
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
              <div className="flex h-11 items-center rounded-full border border-border/60 bg-background shadow-sm">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-12 items-center justify-center rounded-l-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <div className="flex h-full min-w-[3rem] items-center justify-center border-x border-border/40 font-semibold text-foreground">
                  {quantity}
                </div>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-full w-12 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="group h-14 w-full rounded-full text-base font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30"
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

      {/* Reviews Section */}
      <div className="mt-20 border-t border-border/40 pt-10">
        <h2 className="text-2xl font-bold text-foreground mb-8">Đánh giá sản phẩm</h2>
        
        {canUserReview && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 mb-10 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Mời bạn đánh giá sản phẩm</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star className={`size-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-muted/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <textarea 
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                />
              </div>
              <Button type="submit" disabled={submittingReview} className="w-full">
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </form>
          </div>
        )}

        <div className="space-y-6 max-w-3xl">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="border-b border-border/40 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {r.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{r.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`size-4 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted/30'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground mt-3 pl-13 ml-13">{r.comment}</p>
                {r.adminReply && (
                  <div className="mt-3 ml-13 p-4 bg-muted/50 rounded-xl border border-border/50 text-sm">
                    <p className="font-semibold text-primary mb-1 text-xs">Phản hồi từ Shop:</p>
                    <p className="text-muted-foreground">{r.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
