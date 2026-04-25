export type ActionResult<T> = T | { ok: false; error: string };

const NETWORK_HINTS = ["failed to fetch", "load failed", "networkerror", "network", "timeout"];

export function isNetworkError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return NETWORK_HINTS.some((hint) => lower.includes(hint));
}

export const NETWORK_ERROR_MESSAGE =
  "Network connection failed. Please check your internet connection and try again.";

interface CallOptions {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Run a server action from the client with a generous timeout and
 * a single automatic retry when the failure looks like a transient
 * network issue. Server-action requests stay on the same origin
 * as the page, so this is mostly defensive against flaky CDN edges.
 */
export async function callAction<T>(
  action: () => Promise<T>,
  { timeoutMs = 25_000, retries = 1 }: CallOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      );
      return await Promise.race([action(), timeout]);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : "";
      if (!isNetworkError(msg) || attempt === retries) break;
    }
  }

  throw lastError;
}
