import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { HeroSection } from "@/components/HeroSection"
import { ProductCard } from "@/components/ProductCard"
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types"
import { productService } from "@/services/productService"

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featured = await productService.getFeatured()
        setProducts(featured)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-2 text-muted-foreground">
              Những bó hoa được yêu thích nhất tại BloomShop
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/products">
              Xem tất cả <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-foreground">
              Chưa có sản phẩm nổi bật
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link to="/products">
              Xem tất cả sản phẩm <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tại sao chọn BloomShop?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Chúng tôi cam kết mang đến trải nghiệm mua hoa tốt nhất
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Hoa tươi mỗi ngày",
                desc: "Hoa được nhập mới mỗi ngày từ các vườn trồng uy tín, đảm bảo độ tươi tối đa.",
                gradient: "from-rose-500/10 to-pink-500/10",
              },
              {
                title: "Giao hàng tận nơi",
                desc: "Dịch vụ giao hàng nhanh chóng, đúng giờ. Miễn phí giao hàng cho đơn từ 500K.",
                gradient: "from-amber-500/10 to-orange-500/10",
              },
              {
                title: "Thiết kế theo yêu cầu",
                desc: "Đội ngũ florist chuyên nghiệp sẵn sàng tạo ra bó hoa độc đáo theo ý bạn.",
                gradient: "from-emerald-500/10 to-green-500/10",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl bg-gradient-to-br ${item.gradient} p-8`}
              >
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
