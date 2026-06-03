import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DevModeEmpty({ title }: { title?: string }) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{title ?? "Local dev mode"}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Auth bypass is on, but no session yet. Add{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">DEV_EMAIL</code>{" "}
        and{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          DEV_PASSWORD
        </code>{" "}
        to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code>{" "}
        (create the user once in Supabase Auth), then refresh. See{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          env.local.example
        </code>
        .
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
