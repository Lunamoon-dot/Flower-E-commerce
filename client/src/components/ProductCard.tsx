import { Link } from "react-router-dom"
import { ShoppingCart, Star } from "lucide-react"
import type { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/useCartStore"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

const CATEGORY_LABELS: Record<string, string> = {
  roses: "Hoa hồng",
  tulips: "Hoa tulip",
  bouquets: "Bó hoa",
  orchids: "Hoa lan",
  sunflowers: "Hướng dương",
  lilies: "Hoa ly",
  mixed: "Hoa tổng hợp",
}



export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <Link to={`/products/${product._id}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-foreground">
              Hết hàng
            </span>
          </div>
        )}
        {product.featured && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            Nổi bật
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Badge variant="secondary" className="mb-2 w-fit text-xs">
          {CATEGORY_LABELS[product.category] || product.category}
        </Badge>

        <Link
          to={`/products/${product._id}`}
          className="mb-1 line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mb-3 flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)} ({product.numReviews})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="icon-sm"
            disabled={product.stock <= 0}
            onClick={(e) => {
              e.preventDefault()
              addToCart(product)
            }}
          >
            <ShoppingCart className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
