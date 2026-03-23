import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { SlidersHorizontal } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton"
import { CategoryFilter } from "@/components/CategoryFilter"
import { SearchBar } from "@/components/SearchBar"
import { useDebounce } from "@/hooks/useDebounce"
import { Button } from "@/components/ui/button"
import type { Product, ProductFilters } from "@/types"
import { productService } from "@/services/productService"

type SortOption = "newest" | "price_asc" | "price_desc" | "rating"

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [sort, setSort] = useState<SortOption>("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const category = searchParams.get("category") || ""
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const filters: ProductFilters = { sort }
        if (category) filters.category = category as any
        if (debouncedSearch) filters.search = debouncedSearch

        const result = await productService.getAll(filters)
        setProducts(result.data)
        setTotalCount(result.total)
      } catch {
        setProducts([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, debouncedSearch, sort])

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams)
    if (cat) {
      params.set("category", cat)
    } else {
      params.delete("category")
    }
    setSearchParams(params)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {category ? `Danh mục: ${category}` : "Tất cả sản phẩm"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalCount} sản phẩm
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-sm">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-1 size-4" />
            Bộ lọc
          </Button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>
      </div>

      <div className={`mb-6 ${showFilters ? "block" : "hidden"} sm:block`}>
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-foreground">
            Không tìm thấy sản phẩm
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
