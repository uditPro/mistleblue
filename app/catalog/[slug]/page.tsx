import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArtwork from "@/components/CardArtwork";
import JsonLd from "@/components/JsonLd";
import { getCatalogEntries, getCatalogProduct, getCatalogText } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = (await getCatalogEntries()).filter((entry) => entry.type === "product");
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) return { title: "Card not found", robots: { index: false, follow: false } };

  const productDescription = getCatalogText(product.content);
  const description = productDescription
    ? `${product.title}: ${productDescription}`.slice(0, 160)
    : `${product.title}, a custom NFC business card with QR code by Mistleblue.`;
  const url = `${siteUrl}/catalog/${encodeURIComponent(product.slug)}`;

  return {
    title: `${product.title} | Custom NFC Business Card`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: product.title, description, siteName: "Mistleblue" },
    twitter: { card: "summary", title: product.title, description },
  };
}

export default async function CatalogProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();

  const isWhite = /white/i.test(product.slug);
  const productDescription = getCatalogText(product.content);
  const productUrl = `${siteUrl}/catalog/${encodeURIComponent(product.slug)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.title,
        description: productDescription,
        url: productUrl,
        category: "NFC business cards",
        material: "PVC",
        brand: { "@type": "Brand", name: "Mistleblue" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Cards", item: `${siteUrl}/#collection` },
          { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
        ],
      },
    ],
  };
  const safeContent = sanitizeHtml(product.content, {
    allowedTags: [
      "address", "article", "b", "blockquote", "br", "caption", "code", "dd", "div",
      "dl", "dt", "em", "figcaption", "figure", "h2", "h3", "h4", "hr", "i", "li",
      "ol", "p", "pre", "s", "span", "strong", "sub", "sup", "u", "ul",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });

  return (
    <main className="detail-page">
      <JsonLd data={productSchema} />
      <Link href="/#collection" className="detail-back">
        <span aria-hidden="true">←</span> &nbsp; Back to the collection
      </Link>
      <div className="detail-layout">
        <div className="detail-art">
          <CardArtwork title={product.title} variant={isWhite ? "white" : "black-gold"} />
          <p className="detail-art-caption">MISTLEBLUE® &nbsp; / &nbsp; THE EVERYDAY OBJECT, RECONSIDERED</p>
        </div>
        <div className="detail-copy">
          <p className="eyebrow"><span className="eyebrow-number">01</span> THE SIGNATURE EDITION</p>
          <h1>{product.title}</h1>
          <div className="detail-labels">
            <span>PVC CARD</span>
            <span>NFC ENABLED</span>
            <span>QR READY</span>
          </div>
          <div
            className="rich-content detail-description"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
          <a
            href={`mailto:hello@mistleblue.com?subject=${encodeURIComponent(`Enquiry: ${product.title}`)}`}
            className="button button-dark detail-cta"
          >
            Ask about this card <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </main>
  );
}
