import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="size-7 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
