"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
export default function AuthScreen({
  registration,
}: {
  registration: boolean;
}) {
  const [create, setCreate] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <div className="brand">
          <span className="brand-mark">f</span>forma
        </div>
        <div>
          <div className="eyebrow">AN IDEA IS ONLY THE BEGINNING</div>
          <h1>
            Your expertise.
            <br />
            Their next
            <br />
            <em>breakthrough.</em>
          </h1>
          <p>
            A thoughtful workspace to shape knowledge
            <br />
            into something worth learning.
          </p>
          <div className="auth-illustration">
            <div>
              01 <b>Shape the story</b>
            </div>
            <div>
              02 <b>Bring it to life</b>
            </div>
            <div>
              03 <b>Make it yours</b>
            </div>
          </div>
        </div>
        <small>COURSE PLANNING · PRESENTATION DESIGN</small>
      </div>
      <div className="auth-form">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            try {
              if (create) {
                const r = await fetch("/api/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(fields),
                });
                if (!r.ok) throw Error((await r.json()).error);
              }
              const r = await signIn("credentials", {
                ...fields,
                redirect: false,
              });
              if (r?.error)
                throw Error(
                  "Could not sign in. Check your email and password, or try again later.",
                );
              window.location.href = "/";
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="eyebrow">YOUR CREATIVE WORKSPACE</div>
          <h2>{create ? "Start something meaningful." : "Welcome back."}</h2>
          <p>
            {create
              ? "Create an account to start shaping your first course."
              : "Your next great course is waiting for you."}
          </p>
          <label>
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={create ? "new-password" : "current-password"}
              placeholder="At least 12 characters"
            />
          </label>
          <p className="error" role="alert">
            {error}
          </p>
          <button disabled={busy} className="primary wide">
            {busy
              ? "Please wait…"
              : create
                ? "Create account →"
                : "Enter your studio →"}
          </button>
          {registration && (
            <button
              type="button"
              className="text-button wide"
              onClick={() => {
                setCreate(!create);
                setError("");
              }}
            >
              {create
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          )}
          <p className="fine-print">
            Your courses are private to your account.
            <br />
            AI generation stays off until a provider is configured.
          </p>
        </form>
      </div>
    </div>
  );
}
