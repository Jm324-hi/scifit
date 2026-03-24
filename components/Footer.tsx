import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Kineroz</span>
        <div className="flex gap-4">
          <Link
            href="/exercises"
            className="transition-colors hover:text-foreground"
          >
            Exercises
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/settings"
            className="transition-colors hover:text-foreground"
          >
            Settings
          </Link>
        </div>
      </div>
    </footer>
  );
}
