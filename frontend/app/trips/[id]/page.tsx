"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Daycards from "@/components/Daycards";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import type { Trip } from "@/types/trip";
import CreateTripFloat from "@/components/CreateTripFloat";

function splitItinerary(markdown: string) {
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  if (headings.length === 0)
    return [{ title: "Itinerary", content: markdown.trim() }];
  return headings.map((heading, index) => ({
    title: heading[1].trim(),
    content: markdown
      .slice(
        heading.index! + heading[0].length,
        headings[index + 1]?.index ?? markdown.length,
      )
      .trim(),
  }));
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = Number(params?.id);
    const token = localStorage.getItem("access_token");

    if (!token || !Number.isFinite(id)) {
      setIsLoading(false);
      return;
    }

    async function loadTrip() {
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/trips/${id}`,
          {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Trip not found");
        }

        const tripData = (await response.json()) as Trip;
        setTrip(tripData);
      } catch {
        setTrip(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrip();
  }, [params?.id]);

  if (isLoading) {
    return (
      <AuthGuard>
        <main className="history-page">
          <div className="history-shell detail-shell">
            <div className="detail-topbar">
              <Navbar backHref="/trips" backLabel="Trip history" showNewTrip />
            </div>
            <section className="empty-history" role="status">
              <span className="empty-compass" aria-hidden="true">
                ✦
              </span>
              <h2>Memuat detail trip...</h2>
            </section>
            <CreateTripFloat />
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!trip) {
    return (
      <AuthGuard>
        <main className="history-page">
          <div className="history-shell detail-shell">
            <div className="detail-topbar">
              <Navbar backHref="/trips" backLabel="Trip history" showNewTrip />
            </div>
            <section className="empty-history" role="status">
              <span className="empty-compass" aria-hidden="true">
                ✦
              </span>
              <h2>Trip tidak ditemukan</h2>
              <p>Rencana perjalanan ini tidak tersedia untuk akun saat ini.</p>
            </section>
            <CreateTripFloat />
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="history-page">
        <div className="history-shell detail-shell">
          <div className="detail-topbar">
            <Navbar backHref="/trips" backLabel="Trip history" showNewTrip />
          </div>
          <header className="detail-header">
            <p className="eyebrow">Your saved journey</p>
            <h1>{trip.destination}</h1>
            <p>
              {trip.category} · {trip.days} days
            </p>
          </header>
          <Daycards
            cards={[
              { label: "Budget", value: formatAmount(trip.budget) },
              { label: "Trip category", value: trip.category },
              { label: "Daily budget", value: formatAmount(trip.daily_budget) },
              {
                label: "Travel style",
                value: trip.travel_style || trip.category,
              },
            ]}
          />
          <section className="detail-itinerary">
            <p className="eyebrow">The plan</p>
            <h2>Itinerary</h2>
            {trip.ai_recommendation ? (
              splitItinerary(trip.ai_recommendation).map((section, index) => (
                <article
                  className="itinerary-card detail-itinerary-card"
                  key={`${section.title}-${index}`}
                >
                  <h3>{section.title}</h3>
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </article>
              ))
            ) : (
              <p className="empty-copy">
                Itinerary belum tersedia untuk trip ini.
              </p>
            )}
          </section>
          <CreateTripFloat />
        </div>
      </main>
    </AuthGuard>
  );
}
