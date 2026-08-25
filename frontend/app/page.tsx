"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

type Trip = {
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
};

type ItinerarySection = {
  title: string;
  content: string;
};

const travelStyles = [
  { value: "relaxed", label: "Relaxed" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
  { value: "culinary", label: "Culinary" },
  { value: "family", label: "Family" },
  { value: "backpacker", label: "Backpacker" },
];

function splitItinerary(markdown: string): ItinerarySection[] {
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  if (headings.length === 0) {
    return [{ title: "Itinerary", content: markdown.trim() }];
  }

  return headings.map((heading, index) => {
    const headingStart = heading.index ?? 0;
    const contentStart = headingStart + heading[0].length;
    const contentEnd = headings[index + 1]?.index ?? markdown.length;

    return {
      title: heading[1].trim(),
      content: markdown.slice(contentStart, contentEnd).trim(),
    };
  });
}

function getDestinationImage(
  destination: string,
  title: string,
  index: number,
) {
  const imageSeed = encodeURIComponent(`${destination}-${title}-${index}`);
  return `https://picsum.photos/seed/${imageSeed}/1200/675`;
}

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

function Footer() {
  return (
    <footer className="site-footer">
      <span>© 2026 Kelana AI</span>
      <span className="footer-divider">•</span>
      <a href="https://github.com" target="_blank" rel="noreferrer">
        GitHub
      </a>
      <a href="mailto:hello@kelana.ai">Kontak</a>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="travel-page">
      <div className="map-grid" aria-hidden="true" />
      <TravelOrnaments side="left" />
      <section className="travel-content">
        <div className="brand-mark">
          <span className="brand-pin">✦</span>
          <p>Kelana AI</p>
        </div>
        <section className="trip-panel">
          <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Go Away
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Panduan berkelana kemana saja
            </p>
          </header>
          <TripForm />
        </section>
        <Footer />
      </section>
      <TravelOrnaments side="right" />
    </main>
  );
}

function TripForm() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTravelStyleOpen, setIsTravelStyleOpen] = useState(false);
  const [travelStyle, setTravelStyle] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setTrip(null);

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
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        body: JSON.stringify({
          destination,
          days,
          budget,
          travel_style: travelStyle,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to generate your trip. Please try again.");
      }

      setTrip((await response.json()) as Trip);
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

      {trip && (
        <section
          className="mt-8 border-t border-slate-800 pt-8"
          aria-live="polite"
        >
          <h2 className="text-2xl font-semibold text-white">
            Your Trip Details
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="details-card rounded-xl bg-slate-950 p-4">
              <dt className="text-sm text-slate-500">Destination</dt>
              <dd className="mt-1 font-medium text-cyan-300">
                {trip.destination}
              </dd>
            </div>
            <div className="details-card rounded-xl bg-slate-950 p-4">
              <dt className="text-sm text-slate-500">Budget</dt>
              <dd className="mt-1 font-medium text-white">
                {trip.budget.toLocaleString()}
              </dd>
            </div>
            <div className="details-card rounded-xl bg-slate-950 p-4">
              <dt className="text-sm text-slate-500">Category</dt>
              <dd className="mt-1 font-medium text-white">{trip.category}</dd>
            </div>
            <div className="details-card rounded-xl bg-slate-950 p-4">
              <dt className="text-sm text-slate-500">Daily Budget</dt>
              <dd className="mt-1 font-medium text-white">
                {trip.daily_budget.toLocaleString()}
              </dd>
            </div>
          </dl>
          {trip.ai_recommendation && (
            <div className="mt-6 space-y-4 font-[family-name:var(--font-montserrat)]">
              <h3 className="font-semibold text-white">Itinerary</h3>
              <div className="space-y-4">
                {splitItinerary(trip.ai_recommendation).map(
                  (section, index) => (
                    <article
                      className="itinerary-card rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-black/10"
                      key={`${section.title}-${index}`}
                    >
                      <div className="itinerary-image-wrap">
                        <Image
                          alt={`Pemandangan ${section.title} di ${trip.destination}`}
                          className="itinerary-image"
                          fill
                          sizes="(max-width: 700px) 100vw, 640px"
                          src={getDestinationImage(
                            trip.destination,
                            section.title,
                            index,
                          )}
                          unoptimized
                        />
                      </div>
                      <h4 className="text-lg font-bold text-cyan-300">
                        {section.title}
                      </h4>
                      <ReactMarkdown
                        components={{
                          h3: ({ children }) => (
                            <h5 className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-100">
                              {children}
                            </h5>
                          ),
                          p: ({ children }) => (
                            <p className="mt-3 text-sm leading-7 text-slate-300 first:mt-0">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
                              {children}
                            </ul>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-white">
                              {children}
                            </strong>
                          ),
                          hr: () => <hr className="my-5 border-slate-800" />,
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </article>
                  ),
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
