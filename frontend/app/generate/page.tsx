"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type Trip = {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
};

const travelStyles = [
  { value: "solo", label: "Solo" },
  { value: "family", label: "Family" },
  { value: "backpacker", label: "Backpacker" },
];

function LoadingState() {
  return (
    <div
      aria-live="polite"
      aria-label="Sedang menyiapkan itinerary"
      className="loading-panel mt-8"
      role="status"
    >
      <div className="loading-copy">
        <span className="loading-eyebrow">Kelana AI</span>
        <p>Merangkai perjalanan terbaik untukmu...</p>
      </div>
      <div className="loading-spinner" aria-hidden="true" />
    </div>
  );
}

function TravelOrnaments({ side }: { side: "left" | "right" }) {
  const landmarks =
    side === "left"
      ? [
          { icon: "🗼", name: "Paris" },
          { icon: "🗿", name: "Merlion" },
        ]
      : [
          { icon: "🗻", name: "Fuji" },
          { icon: "🕌", name: "Landmark" },
        ];

  return (
    <aside
      className={`travel-ornaments travel-ornaments-${side}`}
      aria-hidden="true"
    >
      <div className="signpost">
        <span className="signpost-pole" />
        <span className="direction-sign direction-sign-top">
          {side === "left" ? "EXPLORE" : "ADVENTURE"}
        </span>
        <span className="direction-sign direction-sign-bottom">
          {side === "left" ? "GO!" : "DISCOVER"}
        </span>
      </div>
      <div className="landmark-stack">
        {landmarks.map((landmark) => (
          <div className="landmark" key={landmark.name}>
            <span>{landmark.icon}</span>
            <small>{landmark.name}</small>
          </div>
        ))}
      </div>
    </aside>
  );
}

function TripForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTravelStyleOpen, setIsTravelStyleOpen] = useState(false);
  const [travelStyle, setTravelStyle] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const destination = String(formData.get("destination") ?? "").trim();
    const days = Number(formData.get("days"));
    const budget = Number(formData.get("budget"));
    const travelStyle = String(formData.get("travelStyle") ?? "");

    if (
      !destination ||
      !Number.isInteger(days) ||
      days < 1 ||
      !Number.isFinite(budget) ||
      budget < 0 ||
      !travelStyle
    ) {
      setError("Please complete all fields with valid values.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        body: JSON.stringify({
          destination,
          days,
          budget,
          travel_style: travelStyle,
        }),
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody?.detail ??
            "Unable to generate your trip. Please try again.",
        );
      }

      const trip = (await response.json()) as Trip;
      router.push(`/trips/${trip.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="destination"
          >
            Destination
          </label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            id="destination"
            name="destination"
            placeholder="Where do you want to go?"
            required
            type="text"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-200"
              htmlFor="days"
            >
              Days
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              id="days"
              min="1"
              name="days"
              placeholder="e.g. 5"
              required
              type="number"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-200"
              htmlFor="budget"
            >
              Budget
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              id="budget"
              min="0"
              name="budget"
              placeholder="e.g. 5000000"
              required
              type="number"
            />
          </div>
        </div>

        <div className="travel-style-field">
          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="travel-style"
          >
            Travel Style
          </label>
          <div className="travel-style-select-wrap">
            <input name="travelStyle" type="hidden" value={travelStyle} />
            <button
              aria-expanded={isTravelStyleOpen}
              aria-haspopup="listbox"
              className="travel-style-select w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              id="travel-style"
              onClick={() => setIsTravelStyleOpen((isOpen) => !isOpen)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsTravelStyleOpen(false);
              }}
              type="button"
            >
              {travelStyles.find((style) => style.value === travelStyle)
                ?.label ?? "Select your travel style"}
              <span className="travel-style-chevron" aria-hidden="true">
                {isTravelStyleOpen ? "↑" : "↓"}
              </span>
            </button>
            {isTravelStyleOpen && (
              <div
                className="travel-style-options"
                role="listbox"
                aria-labelledby="travel-style"
              >
                {travelStyles.map((style) => (
                  <button
                    aria-selected={travelStyle === style.value}
                    className="travel-style-option"
                    key={style.value}
                    onClick={() => {
                      setTravelStyle(style.value);
                      setIsTravelStyleOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    {style.label}
                    {travelStyle === style.value && (
                      <span aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Generating..." : "Generate Ai Trip"}
        </button>
      </form>

      {isLoading && <LoadingState />}

      {error && (
        <p
          className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

export default function GenerateTripPage() {
  return (
    <AuthGuard>
      <main className="travel-page">
        <div className="map-grid" aria-hidden="true" />
        <TravelOrnaments side="left" />
        <section className="travel-content">
          <Navbar backHref="/" backLabel="Home" showHistory />
          <section className="trip-panel">
            <div className="hero-media">
              <Image
                alt="Pemandangan alam untuk inspirasi perjalanan"
                fill
                priority
                sizes="(max-width: 700px) 100vw, 640px"
                src="/lonson.avif"
              />
              <div className="hero-media-caption">
                <span>Plan less. Wander more.</span>
              </div>
            </div>
            <header className="mb-10">
              <p className="eyebrow">Your next story starts here</p>
              <h1 className="home-title">Berkelana tanpa ragu.</h1>
              <p className="home-intro">
                Kelana AI merangkai perjalanan yang terasa personal, dari
                destinasi impian hingga itinerary yang siap kamu jalani.
              </p>
            </header>
            <TripForm />
          </section>
          <Footer />
        </section>
        <TravelOrnaments side="right" />
      </main>
    </AuthGuard>
  );
}
