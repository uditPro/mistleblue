"use client";

import { useState, type PointerEvent } from "react";
import CardArtwork from "@/components/CardArtwork";

interface InteractiveCardProps {
  title: string;
  variant: "black-gold" | "white";
}

export default function InteractiveCard({ title, variant }: InteractiveCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const isDark = variant === "black-gold";

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--card-tilt-x", `${-y * 8}deg`);
    event.currentTarget.style.setProperty("--card-tilt-y", `${x * 10}deg`);
  }

  function resetPointerTilt(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--card-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--card-tilt-y", "0deg");
  }

  return (
    <div className="interactive-card-wrap">
      <div
        className="interactive-card-scene"
        onPointerLeave={resetPointerTilt}
        onPointerMove={handlePointerMove}
      >
        <div className={`interactive-card${isFlipped ? " is-flipped" : ""}`}>
          <CardArtwork
            ariaHidden={isFlipped}
            className="interactive-card-face interactive-card-front"
            title={title}
            variant={variant}
          />
          <div
            aria-label={`${title} business card reverse design`}
            aria-hidden={!isFlipped}
            className={`interactive-card-face interactive-card-back${isDark ? " card-back-dark" : " card-back-light"}`}
            role="img"
          >
            <div className="card-back-top">
              <span className="card-back-mark">m.</span>
              <span>MISTLEBLUE <i /> NFC + QR</span>
            </div>
            <div className="card-back-identity">
              <span>PERSONALIZED FOR YOU</span>
              <strong>{name.trim() || "YOUR NAME"}</strong>
              <span className="card-back-rule" />
              <span>{[role.trim(), company.trim()].filter(Boolean).join(" · ") || "YOUR ROLE · YOUR COMPANY"}</span>
            </div>
            <div className="card-back-bottom">
              <div className="card-back-scan" aria-hidden="true">
                <span />
                <span />
                <span />
                <b>QR</b>
              </div>
              <div className="card-back-connect">
                <span>MADE TO BE SHARED</span>
                <strong>Tap or scan<br />to connect.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-view-controls">
        <span className="card-view-label" aria-live="polite">
          {isFlipped ? "REVERSE SIDE" : "FRONT SIDE"}
        </span>
        <button
          aria-label={isFlipped ? "Show card front" : "Show card back"}
          aria-pressed={isFlipped}
          className="card-flip-button"
          onClick={() => setIsFlipped((current) => !current)}
          title={isFlipped ? "Show card front" : "Show card back"}
          type="button"
        >
          <span aria-hidden="true">↻</span>
          <span>{isFlipped ? "Show front" : "Show reverse"}</span>
        </button>
      </div>
      <div className="card-personalizer">
        <p className="card-personalizer-heading">MAKE IT YOURS</p>
        <label>
          Name
          <input
            autoComplete="off"
            maxLength={32}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Alex Morgan"
            type="text"
            value={name}
          />
        </label>
        <div className="card-personalizer-row">
          <label>
            Role
            <input
              autoComplete="off"
              maxLength={28}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Creative director"
              type="text"
              value={role}
            />
          </label>
          <label>
            Company
            <input
              autoComplete="off"
              maxLength={28}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Studio North"
              type="text"
              value={company}
            />
          </label>
        </div>
        <p className="card-personalizer-note">Preview only. Your details stay in this browser and are not saved or sent.</p>
      </div>
    </div>
  );
}