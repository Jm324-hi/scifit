import { NextRequest } from "next/server";

/**
 * Same-origin proxy for Supabase requests issued by the browser client.
 *
 * Why: browsers in some networks (notably mainland China without a VPN)
 * cannot reliably reach `*.supabase.co`. Routing all data/auth requests
 * through `kineroz.com/api/sb/*` keeps the browser on a single, reachable
 * origin, while the Netlify function forwards to Supabase from outside
 * the restrictive network.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");

const HOP_BY_HOP_REQUEST = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "cookie",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-id",
  "x-nf-request-id",
]);

const HOP_BY_HOP_RESPONSE = new Set([
  "transfer-encoding",
  "connection",
  "content-encoding",
  "content-length",
]);

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  if (!UPSTREAM) {
    return new Response("Supabase URL not configured", { status: 500 });
  }

  const { path } = await ctx.params;
  const search = req.nextUrl.search;
  const target = `${UPSTREAM}/${path.join("/")}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_REQUEST.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "upstream_unreachable" }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  const respHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_RESPONSE.has(key.toLowerCase())) {
      respHeaders.set(key, value);
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
