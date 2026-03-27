import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartStore()
  const { product, quantity } = item

  return (
    <div className="flex gap-4 rounded-xl border border-border/60 bg-card p-4">
      <div className="size-24 shrink-0 overflow-hidden rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          <p className="mt-0.5 text-sm text-primary font-medium">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => updateQuantity(product._id, quantity - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <span className="flex size-7 items-center justify-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => updateQuantity(product._id, quantity + 1)}
              disabled={quantity >= product.stock}
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">
              {formatPrice(product.price * quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:text-destructive"
              onClick={() => removeFromCart(product._id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
