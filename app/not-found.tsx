import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow"><span className="eyebrow-number">404</span> PAGE NOT FOUND</p>
      <h1>This introduction<br /><span>isn&apos;t here.</span></h1>
      <p className="not-found-copy">
        The page may have moved. Explore the card collection to find what you were looking for.
      </p>
      <Link className="button button-dark" href="/">
        Back to Mistleblue <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}