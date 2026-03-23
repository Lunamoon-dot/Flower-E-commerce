import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/store/useCartStore"
import { formatPrice } from "@/components/ProductCard"
import type { Product } from "@/types"
import { productService } from "@/services/productService"

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

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(false)
      try {
        const data = await productService.getById(id!)
        setProduct(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-32" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-foreground">
          Không tìm thấy sản phẩm
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sản phẩm này có thể đã bị xoá hoặc không tồn tại
        </p>
        <Button className="mt-6" onClick={() => navigate("/products")}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [product.image]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Quay lại sản phẩm
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`size-20 overflow-hidden rounded-xl border-2 transition-all ${
                    i === selectedImage
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Badge variant="secondary" className="mb-3">
            {CATEGORY_LABELS[product.category] || product.category}
          </Badge>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {product.numReviews > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.numReviews} đánh giá)
              </span>
            </div>
          )}

          <div className="mt-4">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          <Separator className="my-6" />

          <p className="leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Tình trạng:</span>
              {product.stock > 0 ? (
                <Badge variant="secondary" className="text-emerald-600">
                  Còn {product.stock} sản phẩm
                </Badge>
              ) : (
                <Badge variant="destructive">Hết hàng</Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Số lượng:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="flex size-9 items-center justify-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check className="mr-2 size-4" />
                  Đã thêm vào giỏ!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 size-4" />
                  Thêm vào giỏ hàng
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
