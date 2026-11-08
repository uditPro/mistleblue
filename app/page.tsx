import Link from "next/link";
import CardArtwork from "@/components/CardArtwork";
import EmailInquiryForm from "@/components/EmailInquiryForm";
import JsonLd from "@/components/JsonLd";
import { getCatalogEntries, getCatalogText } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

function getCardVariant(slug: string): "black-gold" | "white" {
  return /white/i.test(slug) ? "white" : "black-gold";
}

export default async function HomePage() {
  const products = (await getCatalogEntries()).filter((entry) => entry.type === "product");
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Custom NFC Business Card Collection",
    description: "Explore Mistleblue's NFC business cards with QR codes and customizable designs.",
    url: siteUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.title,
        url: `${siteUrl}/catalog/${encodeURIComponent(product.slug)}`,
      })),
    },
  };

  return (
    <main>
      <JsonLd data={collectionSchema} />
      <section className="hero-section">
        <div className="hero-frame">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span className="eyebrow-dot" />
              A more considered way to connect
            </p>
            <h1>
              Make an
              <br />
              introduction
              <br />
              <span>that stays.</span>
            </h1>
            <p className="hero-description">
              Custom NFC business cards with QR codes, bringing your details together for a more
              memorable introduction.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#collection">
                Explore the cards <span aria-hidden="true">↘</span>
              </a>
              <span className="hero-note">Made for the way business moves now.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Mistleblue card designs">
            <div className="hero-art-caption">
              <span>THE EVERYDAY OBJECT, RECONSIDERED</span>
              <span>01 — 02</span>
            </div>
            <div className="hero-art-stage">
              <div className="hero-card hero-card-back">
                <CardArtwork title="A quieter kind of confidence" variant="white" />
              </div>
              <div className="hero-card hero-card-front">
                <CardArtwork title="Dark Knight & Gold" variant="black-gold" />
              </div>
              <div className="hero-index">
                <span className="hero-index-mark">M.</span>
                <span>Designed to<br />be passed on.</span>
              </div>
            </div>
            <div className="hero-art-bottom">
              <span>PERSONAL. TANGIBLE. INSTANT.</span>
              <span className="hero-art-line" />
              <span>EST. WITH INTENTION</span>
            </div>
          </div>
        </div>
        <div className="hero-rule">
          <span>DESIGNED TO TRAVEL LIGHT</span>
          <span>MADE TO LEAVE SOMETHING BEHIND</span>
          <span className="hero-rule-number">MISTLEBLUE® &nbsp; / &nbsp; 2026</span>
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="collection-wrap">
          <div className="collection-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-number">01</span> THE COLLECTION</p>
              <h2>Small card.<br /><span>Big presence.</span></h2>
            </div>
            <div className="collection-intro">
              <p>
                Thoughtful finishes, made for your everyday introductions. Choose the look that
                feels like you; make the connection your own.
              </p>
              <span className="collection-count">
                {String(products.length).padStart(2, "0")} DESIGNS &nbsp;·&nbsp; SCROLL TO EXPLORE
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="empty-collection">
              <span className="eyebrow">THE FIRST EDITION</span>
              <h3>A new collection is on its way.</h3>
              <p>Published card designs will appear here once they are added to the local catalogue.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product, index) => {
                const summary = getCatalogText(product.content);
                const variant = getCardVariant(product.slug);

                return (
                  <article className="product-item" key={product.id}>
                    <Link
                      className="product-art-link"
                      href={`/catalog/${encodeURIComponent(product.slug)}`}
                      aria-label={`View ${product.title}`}
                    >
                      <CardArtwork
                        title={product.title}
                        variant={variant}
                        className="product-art"
                      />
                      <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="product-open" aria-hidden="true">↗</span>
                    </Link>
                    <div className="product-meta">
                      <div>
                        <p className="product-category">
                          {variant === "white" ? "THE PERSONAL EDIT" : "THE SIGNATURE EDIT"}
                        </p>
                        <h3>{product.title}</h3>
                      </div>
                      <span className="product-nfc">PVC <i /> NFC</span>
                    </div>
                    <p className="product-summary">
                      {summary.length > 150 ? `${summary.slice(0, 147).trimEnd()}…` : summary}
                    </p>
                    <Link className="product-details" href={`/catalog/${encodeURIComponent(product.slug)}`}>
                      Discover this card <span aria-hidden="true">↗</span>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="details-section" id="how-it-works" aria-labelledby="details-title">
        <div className="details-wrap">
          <div className="details-heading">
            <p className="eyebrow"><span className="eyebrow-number">02</span> A BETTER HANDOFF</p>
            <h2 id="details-title">Your details,<br /><span>one tap away.</span></h2>
          </div>
          <div className="details-grid">
            <article className="detail-step">
              <span className="detail-step-number">01</span>
              <h3>Tap to connect</h3>
              <p>Share your digital profile with the built-in NFC chip on a compatible smartphone.</p>
            </article>
            <article className="detail-step">
              <span className="detail-step-number">02</span>
              <h3>Scan the QR code</h3>
              <p>Give people another simple way to reach your details, right from your card.</p>
            </article>
            <article className="detail-step">
              <span className="detail-step-number">03</span>
              <h3>Make it yours</h3>
              <p>Choose a finish and personalize your card with your name, logo, and QR code.</p>
            </article>
          </div>
          <a className="details-contact" href="mailto:hello@mistleblue.com?subject=My%20Mistleblue%20card">
            Find your card <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="manifesto">
        <div className="manifesto-inner">
          <span className="manifesto-number">03 / THE MISTLEBLUE IDEA</span>
          <p>
            Less paper in your pocket.
            <br />
            <span>More of you in the room.</span>
          </p>
          <span className="manifesto-mark" aria-hidden="true">m.</span>
        </div>
      </section>

      <section className="email-inquiry-section" aria-labelledby="email-inquiry-title">
        <div className="email-inquiry-inner">
          <div className="email-inquiry-copy">
            <p className="eyebrow"><span className="eyebrow-number">04</span> A MORE MEMORABLE HELLO</p>
            <h2 id="email-inquiry-title">Let&apos;s make<br /><span>it personal.</span></h2>
          </div>
          <div className="email-inquiry-content">
            <p>Tell us where to reach you and we&apos;ll open a note to our team. Ask a question or start planning your card.</p>
            <EmailInquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
