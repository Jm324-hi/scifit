import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
