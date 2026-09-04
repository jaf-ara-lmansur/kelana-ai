"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeName, setWelcomeName] = useState("di Kelana AI");

  useEffect(() => {
    const loginStateTimer = window.setTimeout(() => {
      setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
    }, 0);

    if (sessionStorage.getItem("show_welcome_message") !== "true") {
      return () => window.clearTimeout(loginStateTimer);
    }

    const showMessageTimer = window.setTimeout(() => {
      sessionStorage.removeItem("show_welcome_message");
      setShowWelcomeMessage(true);
    }, 0);
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((profile: { name?: string } | null) => {
          if (profile?.name) {
            setWelcomeName(profile.name);
          }
        })
        .catch(() => undefined);
    }
    const hideMessageTimer = window.setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 5000);

    return () => {
      window.clearTimeout(loginStateTimer);
      window.clearTimeout(showMessageTimer);
      window.clearTimeout(hideMessageTimer);
    };
  }, []);

  return (
    <main className="landing-page">
      {showWelcomeMessage && (
        <div className="welcome-overlay" role="presentation">
          <div aria-live="polite" className="welcome-toast" role="status">
            <span className="welcome-toast-mark" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong>Login berhasil</strong>
              <p>Selamat datang, {welcomeName}.</p>
            </div>
            <button
              aria-label="Tutup pesan selamat datang"
              className="welcome-toast-close"
              onClick={() => setShowWelcomeMessage(false)}
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="landing-shell">
        <Navbar />

        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-kicker">BEST DESTINATIONS AROUND THE WORLD</p>
            <h1>
              It&apos;s your
              <span> world.</span>
              <br />
              We&apos;ll help you
              <br />
              explore it
            </h1>
            <p className="hero-text">
              Dedicated to making travel as simple as possible, we help each and
              every one of our clients to find the best options for flights,
              hotels and car hires to book the perfect trip.
            </p>

            <div className="hero-actions">
              <Link
                className="cta-button"
                href={isLoggedIn ? "/generate" : "/login"}
              >
                Let&apos;s Explore
              </Link>
            </div>
          </div>

          <div className="hero-visual" aria-label="Traveler with train image">
            <div className="visual-shape visual-shape-one" aria-hidden="true" />
            <div className="visual-shape visual-shape-two" aria-hidden="true" />
            <div className="train-card">
              <Image
                alt="Traveler standing in front of a train"
                className="train-image"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 600px"
                src="/train.webp"
              />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
