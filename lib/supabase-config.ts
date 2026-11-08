export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return url && anonKey ? { url, anonKey } : null;
}

export function getAppOrigin(requestUrl: string): string {
  return new URL(process.env.NEXT_PUBLIC_APP_URL || requestUrl).origin;
}

export const authCookies = {
  accessToken: "mb-access-token",
  refreshToken: "mb-refresh-token",
  expiresAt: "mb-expires-at",
  verifier: "mb-code-verifier",
} as const;