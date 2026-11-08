import { NextRequest, NextResponse } from "next/server";
import { authCookies, getSupabaseConfig } from "@/lib/supabase-config";

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { email?: string; email_confirmed_at?: string | null };
}

function safeNextPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export async function GET(request: NextRequest) {
  const config = getSupabaseConfig();
  const code = request.nextUrl.searchParams.get("code");
  const verifier = request.cookies.get(authCookies.verifier)?.value;

  if (!config || !code || !verifier || request.nextUrl.searchParams.has("error")) {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  let tokenResponse: TokenResponse;
  try {
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.redirect(new URL("/login?error=link", request.url));
    tokenResponse = (await response.json()) as TokenResponse;
  } catch {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  if (
    !tokenResponse.access_token ||
    !tokenResponse.refresh_token ||
    !tokenResponse.user?.email ||
    !tokenResponse.user.email_confirmed_at
  ) {
    return NextResponse.redirect(new URL("/login?error=verify", request.url));
  }

  const response = NextResponse.redirect(
    new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url),
  );
  const secure = request.nextUrl.protocol === "https:";
  response.cookies.set(authCookies.accessToken, tokenResponse.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: tokenResponse.expires_in ?? 3600,
  });
  response.cookies.set(authCookies.refreshToken, tokenResponse.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set(authCookies.expiresAt, String(Math.floor(Date.now() / 1000) + (tokenResponse.expires_in ?? 3600)), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: tokenResponse.expires_in ?? 3600,
  });
  response.cookies.delete(authCookies.verifier);
  return response;
}