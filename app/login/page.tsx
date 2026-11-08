import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getAuthenticatedSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to view your Mistleblue digital business card.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getAuthenticatedSession()) redirect("/account");
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <Link className="auth-back" href="/">← &nbsp; Back to Mistleblue</Link>
      <div className="auth-panel">
        <p className="eyebrow"><span className="eyebrow-number">YOUR MISTLEBLUE</span> ACCOUNT</p>
        <h1>Your card,<br /><span>right here.</span></h1>
        <p className="auth-description">
          Sign in with the email address linked to your card to see your Mistleblue details.
        </p>
        {error === "link" && <p className="auth-error" role="alert">That sign-in link is invalid or has expired. Request a fresh one below.</p>}
        {error === "verify" && <p className="auth-error" role="alert">Verify your email address before accessing your card.</p>}
        <AuthForm />
      </div>
    </main>
  );
}