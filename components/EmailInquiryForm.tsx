"use client";

import { useState, type FormEvent } from "react";

export default function EmailInquiryForm() {
  const [email, setEmail] = useState("");
  const [draftOpened, setDraftOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent("I'd like to know more about Mistleblue cards");
    const body = encodeURIComponent(`Please contact me about Mistleblue cards.\n\nMy email: ${email}`);
    window.location.href = `mailto:hello@mistleblue.com?subject=${subject}&body=${body}`;
    setDraftOpened(true);
  }

  return (
    <form className="email-inquiry-form" onSubmit={handleSubmit}>
      <label htmlFor="inquiry-email">Your email address</label>
      <div className="email-inquiry-control">
        <input
          autoComplete="email"
          id="inquiry-email"
          maxLength={254}
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <button className="email-inquiry-button" type="submit">
          {draftOpened ? "Open email draft again" : "Start a conversation"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="email-inquiry-note" aria-live="polite">
        {draftOpened
          ? "Your email app should open with a draft. Review it and press send when you’re ready."
          : "We’ll open a draft to our team. Your email isn’t stored on this site."}
      </p>
    </form>
  );
}