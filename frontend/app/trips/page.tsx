"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TripHistoryClient from "@/app/trips/TripHistoryClient";
import type { Trip } from "@/types/trip";
import AuthGuard from "@/components/AuthGuard";
import CreateTripFloat from "@/components/CreateTripFloat";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    async function loadTrips() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/trips", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load trip history.");
        }

        const data = (await response.json()) as Trip[];
        setTrips(data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  return (
    <AuthGuard>
      <main className="history-page">
        <div className="history-shell">
          <header className="history-header">
            <Navbar backHref="/" backLabel="Home" />
            <h1>Trip History</h1>
            <p>
              Perjalanan yang pernah kamu rencanakan, tersimpan di satu tempat.
            </p>
          </header>

          {isLoading ? (
            <section className="empty-history" role="status">
              <span className="empty-compass" aria-hidden="true">
                ✦
              </span>
              <h2>Memuat riwayat trip...</h2>
            </section>
          ) : hasError || trips.length === 0 ? (
            <section className="empty-history" role="status">
              <span className="empty-compass" aria-hidden="true">
                ✦
              </span>
              <h2>
                {hasError ? "History belum dapat dimuat" : "Belum ada trip"}
              </h2>
              <p>
                {hasError
                  ? "Pastikan server Kelana AI sedang berjalan lalu coba lagi."
                  : "Mulai rencanakan perjalanan pertamamu bersama Kelana AI."}
              </p>
              <Link className="primary-button" href="/generate">
                Generate new trip
              </Link>
            </section>
          ) : (
            <TripHistoryClient trips={trips} />
          )}
        </div>
        <CreateTripFloat />
      </main>
    </AuthGuard>
  );
}
