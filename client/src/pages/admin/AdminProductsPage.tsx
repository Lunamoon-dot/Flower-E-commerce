import { useEffect, useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2, Search, Star, X, Check, Upload, ImagePlus, Loader2 } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { formatPrice } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { adminService } from "@/services/adminService"
import api from "@/services/api"
import type { Product, ProductCategory } from "@/types"

/* ─── Constants ────────────────────────────────────────────────── */
const CATEGORIES: ProductCategory[] = [
  "roses", "tulips", "bouquets", "orchids", "sunflowers", "lilies", "mixed",
]
const CATEGORY_LABELS: Record<string, string> = {
  roses: "Hoa hồng", tulips: "Hoa tulip", bouquets: "Bó hoa",
  orchids: "Hoa lan", sunflowers: "Hướng dương", lilies: "Hoa ly", mixed: "Hoa tổng hợp",
}



/* ─── Zod Schema ────────────────────────────────────────────────── */
const productSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(100, "Tên quá dài"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  price: z
    .number()
    .gt(0, "Giá phải lớn hơn 0")
    .max(100_000_000, "Giá không được vượt quá 100 triệu"),
  stock: z
    .number()
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm")
    .max(99_999, "Số lượng quá lớn"),
  category: z.enum(["roses", "tulips", "bouquets", "orchids", "sunflowers", "lilies", "mixed"]),
  image: z.string().min(1, "URL ảnh không được để trống").or(z.literal("")),
  images: z.array(z.string().or(z.literal(""))),
  featured: z.boolean(),
})

type ProductForm = z.infer<typeof productSchema>

const DEFAULT_FORM: ProductForm = {
  name: "", description: "", price: 0, stock: 0,
  category: "roses", image: "", images: [], featured: false,
}

/* ─── Toast ────────────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
      {type === "success" ? <Check className="size-4" /> : <X className="size-4" />}
      {msg}
    </div>
  )
}

/* ─── ImageUploader ─────────────────────────────────────────────── */
function ImageUploader({
  value,
  onChange,
  label = "URL ảnh chính *",
}: {
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Chỉ chấp nhận file ảnh")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File quá lớn (tối đa 5MB)")
      return
    }
    setUploadError("")
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const { data } = await api.post<{ url: string }>("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onChange(data.url)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Upload thất bại"
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
      {/* URL Text Input */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/5 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
        placeholder="https://... hoặc tải ảnh từ thiết bị bên dưới"
      />

      {/* Upload from device */}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="size-3.5 animate-spin" /> Đang tải lên...</>
          ) : (
            <><Upload className="size-3.5" /> Tải ảnh từ thiết bị</>
          )}
        </button>
        {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ""
        }}
      />

      {/* Preview */}
      {value && (
        <div className="relative mt-2 inline-block">
          <img src={value} alt="preview" className="h-24 w-24 rounded-lg object-cover border border-white/10" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Field Error ───────────────────────────────────────────────── */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-400">{msg}</p>
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 7

  const { user: currentUser } = useAuthStore()
  const canManageProducts = currentUser && ["admin", "superadmin", "salestaff"].includes(currentUser.role)
  const canDeleteProducts = currentUser && ["admin", "superadmin"].includes(currentUser.role)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: DEFAULT_FORM,
  })

  const watchImages = watch("images")
  const watchFeatured = watch("featured")

  const loadProducts = async (page = currentPage) => {
    setLoading(true)
    try {
      const res = await adminService.getProducts(page, limit)
      setProducts(res.data)
      setTotalPages(res.totalPages)
      setTotalItems(res.total)
    } catch {
      showToast("Không thể tải sản phẩm", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts(currentPage) }, [currentPage])

  const openCreate = () => {
    setEditProduct(null)
    reset(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditProduct(p)
    reset({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image: p.image,
      images: p.images ?? [],
      featured: p.featured ?? false,
    })
    setShowModal(true)
  }

  const onSubmit = async (data: ProductForm) => {
    // Filter out empty image URLs from additional images
    const cleanData = { ...data, images: data.images.filter((u) => u.trim() !== "") }
    try {
      if (editProduct) {
        const updated = await adminService.updateProduct(editProduct._id, cleanData)
        setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
        showToast("Cập nhật sản phẩm thành công!")
      } else {
        const created = await adminService.createProduct(cleanData)
        setProducts((prev) => [created, ...prev])
        showToast("Tạo sản phẩm thành công!")
      }
      setShowModal(false)
    } catch {
      showToast("Thao tác thất bại", "error")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      showToast("Đã xóa sản phẩm")
    } catch {
      showToast("Xóa thất bại", "error")
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      CATEGORY_LABELS[p.category]?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Sản phẩm</h1>
          <p className="text-sm text-white/40">{totalItems} sản phẩm</p>
        </div>
        {canManageProducts && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:brightness-110"
          >
            <Plus className="size-4" /> Thêm sản phẩm
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full rounded-xl border border-white/5 bg-[#1a1a24] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-2xl border border-white/5 bg-[#1a1a24]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-7 animate-spin text-pink-500" />
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Sản phẩm", "Danh mục", "Giá", "Kho", "Rating", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-[#0f0f14]">
                        {p.image ? <img src={p.image} alt={p.name} className="size-full object-cover" /> : <div className="size-full" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.name}</p>
                        {p.featured && <span className="text-xs text-pink-400">★ Nổi bật</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60">
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock === 0 ? "text-red-400" : p.stock <= 5 ? "text-amber-400" : "text-emerald-400"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="size-3.5 fill-current" />
                      <span className="text-xs text-white/60">{p.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canManageProducts && (
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(p)} className="rounded-lg bg-blue-500/10 p-1.5 text-blue-400 hover:bg-blue-500/20">
                          <Pencil className="size-3.5" />
                        </button>
                        {canDeleteProducts && (
                          <button onClick={() => setDeleteId(p._id)} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20">
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-white/30">Không tìm thấy sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={loading}
      />

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a24] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Xóa sản phẩm?</h3>
            <p className="mt-2 text-sm text-white/50">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5">Huỷ</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1a1a24] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h3 className="text-lg font-bold text-white">
                {editProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Tên sản phẩm *</label>
                  <input
                    {...register("name")}
                    className="w-full rounded-xl border border-white/5 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
                    placeholder="Hoa hồng đỏ..."
                  />
                  <FieldError msg={errors.name?.message} />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Mô tả *</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full rounded-xl border border-white/5 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50 resize-none"
                    placeholder="Mô tả chi tiết sản phẩm..."
                  />
                  <FieldError msg={errors.description?.message} />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">Giá (VNĐ) *</label>
                    <Controller
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <input
                          type="number"
                          min={0}
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-xl border border-white/5 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
                        />
                      )}
                    />
                    <FieldError msg={errors.price?.message} />
                    {watch("price") > 0 && (
                      <p className="mt-1 text-xs text-pink-400">{formatPrice(watch("price"))}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">Số lượng kho *</label>
                    <Controller
                      control={control}
                      name="stock"
                      render={({ field }) => (
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-xl border border-white/5 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-pink-500/50"
                        />
                      )}
                    />
                    <FieldError msg={errors.stock?.message} />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Danh mục *</label>
                  <select
                    {...register("category")}
                    className="w-full rounded-xl border border-white/5 bg-[#0f0f14] px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.category?.message} />
                </div>

                {/* Main Image */}
                <Controller
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <div>
                      <ImageUploader value={field.value} onChange={field.onChange} label="URL ảnh chính *" />
                      <FieldError msg={errors.image?.message} />
                    </div>
                  )}
                />

                {/* Additional Images */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Ảnh bổ sung</label>
                  <div className="space-y-2">
                    {watchImages.map((_, idx) => (
                      <div key={idx}>
                        <Controller
                          control={control}
                          name={`images.${idx}`}
                          render={({ field }) => (
                            <div className="flex gap-2 items-start">
                              <div className="flex-1">
                                <ImageUploader
                                  value={field.value}
                                  onChange={field.onChange}
                                  label={`Ảnh ${idx + 1}`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = watch("images")
                                  setValue("images", cur.filter((_, i) => i !== idx))
                                }}
                                className="mt-6 rounded-xl bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20 shrink-0"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          )}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setValue("images", [...watchImages, ""])}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-xs font-medium text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
                    >
                      <ImagePlus className="size-4" /> Thêm ảnh khác
                    </button>
                  </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("featured", !watchFeatured)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${watchFeatured ? "bg-pink-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${watchFeatured ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <label className="text-sm text-white/60">Sản phẩm nổi bật</label>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 px-6 py-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {isSubmitting ? "Đang lưu..." : editProduct ? "Cập nhật" : "Tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
