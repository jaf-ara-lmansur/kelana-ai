"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
  }, []);

  return (
    <main className="landing-page">
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
