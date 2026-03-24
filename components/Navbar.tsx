"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  Heart,
  TrendingUp,
  History,
  BarChart3,
  Menu,
  LogOut,
  LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plan", label: "Plan", icon: ClipboardList },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/recovery", label: "Recovery", icon: Heart },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/history", label: "History", icon: History },
  { href: "/report", label: "Report", icon: BarChart3 },
] as const;

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-primary transition-colors hover:text-primary/80"
        >
          Kineroz
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user &&
            navLinks.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}

          <div className="ml-2 min-w-[7rem]">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="mr-1.5 size-4" />
                Sign Out
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="text-muted-foreground">
                  <LogIn className="mr-1.5 size-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-lg font-extrabold tracking-tight text-primary">
                Kineroz
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-1 flex-col gap-1 px-2">
              {user &&
                navLinks.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <SheetClose key={href} asChild>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                        {label}
                      </Link>
                    </SheetClose>
                  );
                })}

              <div className="mt-auto border-t pt-3">
                {user ? (
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 size-5" />
                      Sign Out
                    </Button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <LogIn className="size-5" />
                      Sign In
                    </Link>
                  </SheetClose>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
