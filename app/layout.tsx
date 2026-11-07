import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Link from "next/link";
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
  title: {
    default: "Mistleblue — Digital Business Cards",
    template: "%s | Mistleblue",
  },
  description:
    "Thoughtfully designed NFC business cards by Mistleblue. Make a more memorable introduction.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${playfair.variable} min-h-screen font-sans antialiased`}>
        <div className="announcement-bar">
          A better introduction is closer than you think <span aria-hidden="true">✳</span> NFC · QR · YOUR WAY
        </div>
        <header className="site-header">
          <nav aria-label="Main navigation" className="site-nav">
            <Link href="/" className="brand-lockup" aria-label="Mistleblue home">
              <span className="brand-mark">m.</span>
              <span className="brand-name">MISTLEBLUE<span>CONNECTION, CONSIDERED.</span></span>
            </Link>
            <div className="nav-links">
              <Link href="/#collection">The cards</Link>
              <a href="mailto:hello@mistleblue.com">Say hello</a>
              <a className="nav-cta" href="mailto:hello@mistleblue.com?subject=My%20Mistleblue%20card">
                Make it yours <span aria-hidden="true">↗</span>
              </a>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <Link href="/" className="footer-brand"><span>m.</span> MISTLEBLUE</Link>
            <p>Thoughtful design. Meaningful connections.</p>
            <span>© {new Date().getFullYear()} MISTLEBLUE®</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
