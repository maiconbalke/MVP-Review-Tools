import { Skeleton } from "@/components/ui/skeleton";

const FeedSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="w-full aspect-square" />
        <div className="px-4 py-3 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export default FeedSkeleton;
