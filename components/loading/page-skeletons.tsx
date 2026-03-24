import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlanLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-44" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border p-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkoutLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border p-6">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-44" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function RecoveryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <Skeleton className="mx-auto h-40 w-40 rounded-full" />
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="mx-auto h-4 w-56" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export function ProgressLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />

      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-44" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}

export function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-44" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-5">
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <div className="grid gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
