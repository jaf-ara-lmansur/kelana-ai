import TripCard from "@/components/TripCard";
import type { Trip } from "@/types/trip";

export default function TripList({ trips }: { trips: Trip[] }) {
  return (
    <section className="trip-history-list" aria-label="Saved trips">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </section>
  );
}
