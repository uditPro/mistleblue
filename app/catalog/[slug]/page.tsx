import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardArtwork from "@/components/CardArtwork";
import { getCatalogEntries, getCatalogProduct } from "@/lib/catalog";

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

  return product
    ? { title: product.title, description: `${product.title} — Mistleblue Premium Digital Business Card.` }
    : { title: "Card not found" };
}

export default async function CatalogProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();

  const isWhite = /white/i.test(product.slug);
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
