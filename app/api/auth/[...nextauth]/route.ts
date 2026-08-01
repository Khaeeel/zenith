import { NextRequest } from "next/server";
import { handlers } from "@/auth";

async function safe(
  method: "GET" | "POST",
  req: NextRequest,
): Promise<Response> {
  try {
    if (!process.env.AUTH_SECRET) {
      return Response.json(
        {
          message:
            "AUTH_SECRET is missing. Set it in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 500 },
      );
    }
    return await handlers[method](req);
  } catch (err) {
    console.error("[auth] handler error:", err);
    return Response.json(
      {
        message:
          "Auth handler crashed. Check AUTH_SECRET and AUTH_URL (production origin only, or omit AUTH_URL and set AUTH_TRUST_HOST=true).",
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
