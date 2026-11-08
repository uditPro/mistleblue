interface CardArtworkProps {
  title: string;
  variant: "black-gold" | "white";
  className?: string;
  ariaHidden?: boolean;
}

export default function CardArtwork({ title, variant, className = "", ariaHidden = false }: CardArtworkProps) {
  const isDark = variant === "black-gold";

  return (
    <div
      aria-label={`${title} digital business card design`}
      aria-hidden={ariaHidden}
      className={`card-artwork ${isDark ? "card-artwork-dark" : "card-artwork-light"} ${className}`}
      role="img"
    >
      <div className="card-artwork-orbit" />
      <div className="card-artwork-header">
        <span className="card-artwork-monogram">m.</span>
        <span className="card-artwork-edition">DIGITAL BUSINESS CARD</span>
      </div>
      <div className="card-artwork-copy">
        <span className="card-artwork-kicker">MISTLEBLUE · YOUR INTRODUCTION</span>
        <span className="card-artwork-title">{title}</span>
      </div>
      <div className="card-artwork-footer">
        <span className="card-artwork-chip" aria-hidden="true">
          <svg viewBox="0 0 30 22" fill="none">
            <rect x="1" y="1" width="28" height="20" rx="4" />
            <path d="M10 1v20M20 1v20M1 8h9m0 6h10m0-6h9M1 14h9m10-6v6" />
          </svg>
        </span>
        <span className="card-artwork-tap">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7.1 6.2a5.4 5.4 0 0 1 0 7.6m3-10.6a9.6 9.6 0 0 1 0 13.6m-6-7.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
          </svg>
          TAP TO CONNECT
        </span>
      </div>
    </div>
  );
}
