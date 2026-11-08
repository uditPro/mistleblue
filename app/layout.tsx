import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mistleblue | Custom NFC Business Cards",
    template: "%s | Mistleblue",
  },
  description:
    "Discover custom NFC business cards with QR codes by Mistleblue. Share your contact details with a simple tap and make every introduction count.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Mistleblue",
    title: "Mistleblue | Custom NFC Business Cards",
    description:
      "Custom NFC business cards with QR codes, designed to make every introduction count.",
  },
  twitter: {
    card: "summary",
    title: "Mistleblue | Custom NFC Business Cards",
    description:
      "Custom NFC business cards with QR codes, designed to make every introduction count.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${playfair.variable} min-h-screen font-sans antialiased`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
                name: "Mistleblue",
                url: siteUrl,
                email: "hello@mistleblue.com",
              },
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                url: siteUrl,
                name: "Mistleblue",
                publisher: { "@id": `${siteUrl}/#organization` },
              },
            ],
          }}
        />
        <div className="announcement-bar">
          CUSTOM NFC BUSINESS CARDS <span aria-hidden="true">✳</span> TAP · SCAN · CONNECT
        </div>
        <header className="site-header">
          <nav aria-label="Main navigation" className="site-nav">
            <Link href="/" className="brand-lockup" aria-label="Mistleblue home">
              <span className="brand-mark">m.</span>
              <span className="brand-name">MISTLEBLUE<span>CONNECTION, CONSIDERED.</span></span>
            </Link>
            <div className="nav-links">
              <Link href="/#collection">Explore cards</Link>
              <Link className="nav-secondary" href="/#how-it-works">How it works</Link>
              <Link className="nav-secondary" href="/account">My card</Link>
              <a className="nav-cta" href="mailto:hello@mistleblue.com?subject=My%20Mistleblue%20card">
                Start your card <span aria-hidden="true">↗</span>
              </a>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-main">
              <div className="footer-brand-block">
                <Link href="/" className="footer-brand" aria-label="Mistleblue home">
                  <span className="footer-brand-mark">m.</span>
                  <span className="footer-brand-name">MISTLEBLUE<span>CONNECTION, CONSIDERED.</span></span>
                </Link>
                <p>Thoughtfully designed NFC cards for more memorable introductions.</p>
              </div>
              <nav aria-label="Footer navigation" className="footer-links">
                <p className="footer-heading">EXPLORE</p>
                <Link href="/#collection">The cards</Link>
                <Link href="/#how-it-works">How it works</Link>
                <Link href="/account">My card</Link>
              </nav>
              <div className="footer-contact">
                <p className="footer-heading">LET&apos;S CONNECT</p>
                <a className="footer-email" href="mailto:hello@mistleblue.com">hello@mistleblue.com</a>
                <a className="footer-cta" href="mailto:hello@mistleblue.com?subject=My%20Mistleblue%20card">
                  Enquire about a card <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} MISTLEBLUE®</span>
              <span>THOUGHTFUL DESIGN. MEANINGFUL CONNECTIONS.</span>
              <span>NFC · QR · YOUR WAY</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
