import { cookies } from "next/headers";
import { authCookies, getSupabaseConfig } from "@/lib/supabase-config";

export interface AuthenticatedUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; name?: string };
}

export interface AuthenticatedSession {
  user: AuthenticatedUser;
  accessToken: string;
}

export interface CustomerCard {
  wordpress_post_id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authCookies.accessToken)?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const user = (await response.json()) as AuthenticatedUser;
    return user.email ? { user, accessToken } : null;
  } catch {
    return null;
  }
}

export async function getCustomerCards(accessToken: string): Promise<CustomerCard[]> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Card storage is not configured.");

  const endpoint = new URL(`${config.url}/rest/v1/customer_cards`);
  endpoint.searchParams.set("select", "wordpress_post_id,title,slug,content,created_at");
  endpoint.searchParams.set("order", "created_at.desc");

  const response = await fetch(endpoint, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load your cards.");
  return (await response.json()) as CustomerCard[];
}