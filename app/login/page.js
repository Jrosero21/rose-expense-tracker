"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNote("");
    setLoading(true);
    const supabase = createClient();

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      if (!data.session) {
        return setNote(
          "Check your email to confirm your account, then sign in."
        );
      }
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
      router.push("/");
      router.refresh();
    }
  };

  const toggleMode = () => {
    setMode(isSignup ? "signin" : "signup");
    setError("");
    setNote("");
  };

  return (
    <div className="auth-shell">
      <div className="auth-card reveal-pop">
        <div className="auth-brand">
          <div className="brand-mark">
            <Wallet size={18} strokeWidth={2.4} />
          </div>
          <div className="brand-name">Tally</div>
        </div>

        <h1 className="auth-title">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="auth-sub">
          {isSignup
            ? "Start tracking your property expenses."
            : "Sign in to your expense tracker."}
        </p>

        <form className="auth-form" onSubmit={submit}>
          <div className="field">
            <div className="field-label">Email</div>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <div className="field-label">Password</div>
            <input
              className="input"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {note && (
            <div className="auth-note">
              <Check size={14} />
              {note}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading
              ? "Please wait…"
              : isSignup
                ? "Sign up"
                : "Sign in"}
          </button>
        </form>

        <div className="auth-toggle">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button type="button" onClick={toggleMode}>
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
