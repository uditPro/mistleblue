"use client";

import { useState, type FormEvent } from "react";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      setIsSuccess(response.ok);
      setMessage(result.message ?? result.error ?? "Please try again.");
    } catch {
      setIsSuccess(false);
      setMessage("We could not reach the sign-in service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="auth-email">Email address</label>
      <div className="auth-input-row">
        <input
          autoComplete="email"
          id="auth-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <button className="button button-dark" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending…" : "Email me a sign-in link"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className={`auth-message${isSuccess ? " auth-message-success" : ""}`} aria-live="polite">
        {message || "We’ll send a one-time secure link to your inbox. No password needed."}
      </p>
    </form>
  );
}