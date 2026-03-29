import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled }: PaginationProps) {
  if (totalPages <= 1) return null

  // Generate an array of page numbers with ellipsis
  const getPages = () => {
    const pages = []
    
    for (let i = 1; i <= totalPages; i++) {
       // Show first page, last page, and 1 pages around the current page
       if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 1) {
           pages.push(i)
       } else if (pages[pages.length - 1] !== "...") {
           pages.push("...")
       }
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 mt-2">
      <p className="text-sm text-white/40">
        Trang <span className="font-semibold text-white/80">{currentPage}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1 || disabled}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 items-center justify-center rounded-lg border border-white/10 px-2.5 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="size-4" />
        </button>
        
        <div className="hidden sm:flex items-center gap-1.5">
          {getPages().map((page, i) => (
            page === "..." ? (
              <span key={`ellipsis-${i}`} className="flex h-8 items-center px-1 text-white/40">
                <MoreHorizontal className="size-4" />
              </span>
            ) : (
              <button
                key={page}
                disabled={disabled}
                onClick={() => onPageChange(page as number)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  currentPage === page
                    ? "border-pink-500 bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                    : "border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          disabled={currentPage === totalPages || disabled}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 items-center justify-center rounded-lg border border-white/10 px-2.5 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
