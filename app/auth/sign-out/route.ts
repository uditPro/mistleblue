import { NextRequest, NextResponse } from "next/server";
import { authCookies, getSupabaseConfig } from "@/lib/supabase-config";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  const config = getSupabaseConfig();
  const accessToken = request.cookies.get(authCookies.accessToken)?.value;
  if (config && accessToken) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: config.anonKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete(authCookies.accessToken);
  response.cookies.delete(authCookies.refreshToken);
  response.cookies.delete(authCookies.expiresAt);
  response.cookies.delete(authCookies.verifier);
  return response;
}