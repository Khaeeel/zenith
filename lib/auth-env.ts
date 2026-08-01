/**
 * Auth.js throws TypeError: Invalid URL when AUTH_URL / NEXTAUTH_URL is set to a
 * malformed value (quoted string, empty-with-spaces, localhost left on Vercel, etc.).
 * Sanitize once at module load before NextAuth reads process.env.
 */

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Return a valid absolute origin, or null. */
export function parseAuthOrigin(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const cleaned = stripWrappingQuotes(String(raw));
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    // Origin only — Auth.js basePath is /api/auth; path on AUTH_URL causes mismatches.
    return url.origin;
  } catch {
    return null;
  }
}

function vercelOrigin(): string | null {
  const host = process.env.VERCEL_URL?.trim();
  if (!host) return null;
  // VERCEL_URL is host[:port] without protocol
  const withProto = host.startsWith("http://") || host.startsWith("https://")
    ? host
    : `https://${host}`;
  return parseAuthOrigin(withProto);
}

export function resolveAuthSecret(): string | undefined {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    undefined;
  return secret || undefined;
}

/**
 * Prefer an explicit valid AUTH_URL / NEXTAUTH_URL; otherwise VERCEL_URL.
 * Mutates process.env so Auth.js / next-auth never see an invalid URL.
 */
export function sanitizeAuthEnv(): {
  secret: string | undefined;
  url: string | undefined;
  clearedInvalidUrl: boolean;
} {
  const secret = resolveAuthSecret();
  if (secret) {
    process.env.AUTH_SECRET = secret;
  }

  const onVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_URL;

  const rawAuth = process.env.AUTH_URL;
  const rawNext = process.env.NEXTAUTH_URL;
  let parsedAuth = parseAuthOrigin(rawAuth);
  let parsedNext = parseAuthOrigin(rawNext);

  // localhost AUTH_URL on Vercel is a common footgun (copies from .env)
  if (onVercel && parsedAuth?.includes("localhost")) parsedAuth = null;
  if (onVercel && parsedNext?.includes("localhost")) parsedNext = null;

  let clearedInvalidUrl = false;
  if (rawAuth != null && String(rawAuth).trim() !== "" && !parsedAuth) {
    clearedInvalidUrl = true;
    delete process.env.AUTH_URL;
  }
  if (rawNext != null && String(rawNext).trim() !== "" && !parsedNext) {
    clearedInvalidUrl = true;
    delete process.env.NEXTAUTH_URL;
  }

  const resolved =
    parsedAuth || parsedNext || vercelOrigin() || undefined;

  if (resolved) {
    // Keep Auth.js on a known-good origin (no path, no quotes).
    process.env.AUTH_URL = resolved;
  } else {
    // Let trustHost + request Host headers win (local / misconfigured).
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
  }

  if (clearedInvalidUrl) {
    console.error(
      "[auth-env] Ignored invalid AUTH_URL/NEXTAUTH_URL. Use a bare origin like https://your-app.vercel.app, or delete the var and set AUTH_TRUST_HOST=true.",
    );
  }

  return { secret, url: resolved, clearedInvalidUrl };
}

sanitizeAuthEnv();
