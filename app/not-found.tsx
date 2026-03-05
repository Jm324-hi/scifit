import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
