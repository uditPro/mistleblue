import type { Metadata } from "next";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { redirect } from "next/navigation";
import { getAuthenticatedSession, getCustomerCards } from "@/lib/session";

export const metadata: Metadata = {
  title: "My cards",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/login");

  const cards = await getCustomerCards(session.accessToken);
  const firstName = session.user.user_metadata?.full_name?.split(" ")[0]
    ?? session.user.user_metadata?.name?.split(" ")[0];

  return (
    <main className="account-page">
      <div className="account-topline">
        <Link className="account-home" href="/">← &nbsp; Mistleblue</Link>
        <form action="/auth/sign-out" method="post">
          <button className="account-signout" type="submit">Sign out</button>
        </form>
      </div>
      <section className="account-heading">
        <p className="eyebrow"><span className="eyebrow-number">YOUR ACCOUNT</span> MISTLEBLUE</p>
        <h1>{firstName ? `Welcome, ${firstName}.` : "Your cards."}</h1>
        <p className="account-email">Signed in as {session.user.email}</p>
      </section>
      <section className="account-cards" aria-labelledby="account-cards-title">
        <div className="account-section-heading">
          <h2 id="account-cards-title">Your cards</h2>
          <span>{String(cards.length).padStart(2, "0")} {cards.length === 1 ? "CARD" : "CARDS"}</span>
        </div>
        {cards.length === 0 ? (
          <div className="account-empty">
            <p className="eyebrow">NO CARD LINKED YET</p>
            <h3>We couldn&apos;t find a card for this email.</h3>
            <p>Try the email address used when your card was created, or contact us and we&apos;ll help connect it.</p>
            <a className="button button-dark" href="mailto:hello@mistleblue.com?subject=Link%20my%20Mistleblue%20card">
              Contact Mistleblue <span aria-hidden="true">↗</span>
            </a>
          </div>
        ) : (
          <div className="account-card-list">
            {cards.map((card) => {
              const safeContent = sanitizeHtml(card.content, {
                allowedTags: ["a", "b", "blockquote", "br", "div", "em", "h2", "h3", "h4", "i", "li", "ol", "p", "span", "strong", "ul"],
                allowedAttributes: { a: ["href", "target", "rel"] },
                allowedSchemes: ["http", "https", "mailto"],
                transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
              });

              return (
                <article className="account-card" key={card.wordpress_post_id}>
                  <div className="account-card-heading">
                    <div>
                      <p className="product-category">MISTLEBLUE DIGITAL CARD</p>
                      <h3>{card.title}</h3>
                    </div>
                    <span className="account-card-id">CARD {String(card.wordpress_post_id).padStart(4, "0")}</span>
                  </div>
                  <div className="rich-content account-card-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}