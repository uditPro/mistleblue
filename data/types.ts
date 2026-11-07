export type WordPressPostType = "product" | "post" | "page";

export interface CatalogEntry {
  id: number;
  title: string;
  slug: string;
  content: string;
  date: string;
  type: WordPressPostType;
}
