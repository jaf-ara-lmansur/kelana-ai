import Link from "next/link";
import Navbar from "@/components/Navbar";
import TripHistoryClient from "@/app/trips/TripHistoryClient";
import { getTrips } from "@/services/tripServices";
import type { Trip } from "@/types/trip";

export default async function TripsPage() {
  let trips: Trip[] = [];
  let hasError = false;

  try {
    trips = await getTrips();
  } catch {
    hasError = true;
  }

  return (
    <main className="history-page">
      <div className="history-shell">
        <header className="history-header">
          <Navbar backHref="/" backLabel="Home" />
          <h1>Trip History</h1>
          <p>
            Perjalanan yang pernah kamu rencanakan, tersimpan di satu tempat.
          </p>
        </header>
        {hasError || trips.length === 0 ? (
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
            <Link className="primary-button" href="/">
              Generate new trip
            </Link>
          </section>
        ) : (
          <TripHistoryClient trips={trips} />
        )}
      </div>
    </main>
  );
}
