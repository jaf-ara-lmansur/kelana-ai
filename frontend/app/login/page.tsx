"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail ?? "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type ?? "bearer");
      router.push("/");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <header className="auth-header">
            <p>Kelana AI</p>
            <h1>Login</h1>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button className="auth-submit" disabled={isLoading} type="submit">
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <div className="auth-error">{error}</div>}

          <p className="auth-meta">
            Belum punya akun? <Link href="/register">Register</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
