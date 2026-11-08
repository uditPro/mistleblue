import { NextRequest, NextResponse } from "next/server";
import { authCookies, getSupabaseConfig } from "@/lib/supabase-config";

export async function middleware(request: NextRequest) {
  const config = getSupabaseConfig();
  const refreshToken = request.cookies.get(authCookies.refreshToken)?.value;
  const expiresAt = Number(request.cookies.get(authCookies.expiresAt)?.value ?? 0);

  if (!config || !refreshToken || expiresAt > Math.floor(Date.now() / 1000) + 60) {
    return NextResponse.next();
  }

  try {
    const refreshResponse = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (!refreshResponse.ok) {
      const response = NextResponse.next();
      response.cookies.delete(authCookies.accessToken);
      response.cookies.delete(authCookies.refreshToken);
      response.cookies.delete(authCookies.expiresAt);
      return response;
    }

    const session = (await refreshResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!session.access_token || !session.refresh_token) return NextResponse.next();

    const expiresIn = session.expires_in ?? 3600;
    const response = NextResponse.next();
    const cookieOptions = {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax" as const,
      path: "/",
    };
    response.cookies.set(authCookies.accessToken, session.access_token, { ...cookieOptions, maxAge: expiresIn });
    response.cookies.set(authCookies.refreshToken, session.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(authCookies.expiresAt, String(Math.floor(Date.now() / 1000) + expiresIn), {
      ...cookieOptions,
      maxAge: expiresIn,
    });
    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};