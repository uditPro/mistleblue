import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogEntry } from "@/data/types";

const catalogPath = path.join(process.cwd(), "data", "products.json");

function isCatalogEntry(value: unknown): value is CatalogEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;

  return (
    Number.isSafeInteger(entry.id) &&
    typeof entry.title === "string" &&
    typeof entry.slug === "string" &&
    typeof entry.content === "string" &&
    typeof entry.date === "string" &&
    (entry.type === "product" || entry.type === "post" || entry.type === "page")
  );
}

export async function getCatalogEntries(): Promise<CatalogEntry[]> {
  const rawData = await readFile(catalogPath, "utf8");
  const entries: unknown = JSON.parse(rawData);

  if (!Array.isArray(entries) || !entries.every(isCatalogEntry)) {
    throw new Error("data/products.json must contain an array of valid catalog entries.");
  }

  return entries;
}

export async function getCatalogProduct(slug: string): Promise<CatalogEntry | undefined> {
  const entries = await getCatalogEntries();
  return entries.find((entry) => entry.slug === slug && entry.type === "product");
}

export function getCatalogText(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
