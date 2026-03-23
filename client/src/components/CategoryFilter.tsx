import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selected?: string
  onChange: (category: string) => void
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "roses", label: "Hoa hồng" },
  { value: "tulips", label: "Hoa tulip" },
  { value: "bouquets", label: "Bó hoa" },
  { value: "orchids", label: "Hoa lan" },
  { value: "sunflowers", label: "Hướng dương" },
  { value: "lilies", label: "Hoa ly" },
  { value: "mixed", label: "Tổng hợp" },
]

export function CategoryFilter({ selected = "", onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
            selected === cat.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
