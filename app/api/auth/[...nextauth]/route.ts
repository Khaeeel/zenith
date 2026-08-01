import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { resolveAuthSecret, sanitizeAuthEnv } from "@/lib/auth-env";

async function safe(
  method: "GET" | "POST",
  req: NextRequest,
): Promise<Response> {
  const { clearedInvalidUrl } = sanitizeAuthEnv();

  try {
    if (!resolveAuthSecret()) {
      return Response.json(
        {
          message:
            "AUTH_SECRET (or NEXTAUTH_SECRET) is missing. Set it in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 500 },
      );
    }
    return await handlers[method](req);
  } catch (err) {
    const detail =
      err instanceof Error
        ? err.message.replace(/\s+/g, " ").trim().slice(0, 160)
        : "unknown";
    console.error("[auth] handler error:", err);

    if (/invalid url/i.test(detail) || clearedInvalidUrl) {
      return Response.json(
        {
          message:
            "Auth URL invalid. On Vercel: delete AUTH_URL and NEXTAUTH_URL, or set AUTH_URL=https://zenith-leeq-sooty.vercel.app (no quotes, no path). Keep AUTH_TRUST_HOST=true, then redeploy.",
          detail: "Invalid URL",
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        message:
          "Auth handler crashed. Check AUTH_SECRET, AUTH_TRUST_HOST=true, and AUTH_URL (bare production origin or omit).",
        detail,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return safe("GET", req);
}

export async function POST(req: NextRequest) {
  return safe("POST", req);
}
