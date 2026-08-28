import Link from "next/link";
import type { Trip } from "@/types/trip";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

export default function TripCard({ trip }: { trip: Trip }) {
  const travelStyle = trip.travel_style || trip.category;

  return (
    <article className="trip-history-card">
      <div className="trip-destination">
        <span className="destination-initial" aria-hidden="true">
          {trip.destination.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="trip-card-label">Destination</p>
          <h2>{trip.destination}</h2>
          <p className="trip-card-category">{trip.category}</p>
        </div>
      </div>
      <dl className="trip-card-stats">
        <div>
          <dt>Days</dt>
          <dd>{trip.days}</dd>
        </div>
        <div>
          <dt>Daily budget</dt>
          <dd>{formatAmount(trip.daily_budget)}</dd>
        </div>
        <div>
          <dt>Travel style</dt>
          <dd>{travelStyle}</dd>
        </div>
      </dl>
      <Link className="detail-button" href={`/trips/${trip.id}`}>
        Detail
      </Link>
    </article>
  );
}
