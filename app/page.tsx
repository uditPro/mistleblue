import Link from "next/link";
import CardArtwork from "@/components/CardArtwork";
import { getCatalogEntries, getCatalogText } from "@/lib/catalog";

function getCardVariant(slug: string): "black-gold" | "white" {
  return /white/i.test(slug) ? "white" : "black-gold";
}

export default async function HomePage() {
  const products = (await getCatalogEntries()).filter((entry) => entry.type === "product");

  return (
    <main>
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
              Your details, beautifully brought together. One tap turns a first hello into a
              meaningful connection.
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

      <section className="manifesto">
        <div className="manifesto-inner">
          <span className="manifesto-number">02 / THE MISTLEBLUE IDEA</span>
          <p>
            Less paper in your pocket.
            <br />
            <span>More of you in the room.</span>
          </p>
          <span className="manifesto-mark" aria-hidden="true">m.</span>
        </div>
      </section>
    </main>
  );
}
