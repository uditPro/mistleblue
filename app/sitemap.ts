import type { MetadataRoute } from "next";
import { getCatalogEntries } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await getCatalogEntries()).filter((entry) => entry.type === "product");

  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...products.map((product) => ({
      url: `${siteUrl}/catalog/${encodeURIComponent(product.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}