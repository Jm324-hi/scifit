import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = ["/", "/login", "/register", "/privacy", "/exercises", "/forgot-password", "/reset-password", "/auth/callback"];

const profileRequiredPaths = [
  "/dashboard",
  "/plan",
  "/workout",
  "/recovery",
  "/progress",
  "/history",
  "/settings",
  "/report",
];

export async function middleware(request: NextRequest) {
  const { user, supabase, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const needsProfile = profileRequiredPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (user && needsProfile) {
    try {
      const profileQuery = supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000),
      );

      const { data: profile } = await Promise.race([profileQuery, timeout]);

      if (!profile) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    } catch {
      // On timeout or network error, let the user through rather than blocking
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
