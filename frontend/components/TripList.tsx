import TripCard from "@/components/TripCard";
import type { Trip } from "@/types/trip";

export default function TripList({
  trips,
  onEdit,
  onDelete,
}: {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}) {
  return (
    <section className="trip-history-list" aria-label="Saved trips">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          onDelete={() => onDelete(trip)}
          onEdit={() => onEdit(trip)}
          trip={trip}
        />
      ))}
    </section>
  );
}
