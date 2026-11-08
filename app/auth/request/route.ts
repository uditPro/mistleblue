import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authCookies, getAppOrigin, getSupabaseConfig } from "@/lib/supabase-config";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: "Sign-in is not configured yet." }, { status: 503 });
  }

  let email: string;
  try {
    const body: unknown = await request.json();
    const input = typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).email
      : undefined;
    email = typeof input === "string" ? input.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const redirectTo = `${getAppOrigin(request.url)}/auth/callback`;
  const endpoint = new URL(`${config.url}/auth/v1/otp`);
  endpoint.searchParams.set("redirect_to", redirectTo);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        create_user: true,
        code_challenge: challenge,
        code_challenge_method: "s256",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "We could not send a sign-in link. Please try again." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "We could not reach the sign-in service. Please try again." }, { status: 502 });
  }

  const result = NextResponse.json({
    message: "If this email can sign in, a secure link is on its way.",
  });
  result.cookies.set(authCookies.verifier, verifier, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return result;
}