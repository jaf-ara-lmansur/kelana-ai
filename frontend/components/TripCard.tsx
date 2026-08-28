import Link from "next/link";
import type { Trip } from "@/types/trip";

const destinationFlags: Record<string, string> = {
  australia: "🇦🇺",
  bali: "🇮🇩",
  france: "🇫🇷",
  germany: "🇩🇪",
  indonesia: "🇮🇩",
  italy: "🇮🇹",
  japan: "🇯🇵",
  korea: "🇰🇷",
  malaysia: "🇲🇾",
  paris: "🇫🇷",
  singapore: "🇸🇬",
  spain: "🇪🇸",
  thailand: "🇹🇭",
  tokyo: "🇯🇵",
  vietnam: "🇻🇳",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function getDestinationFlag(destination: string) {
  const name = destination.toLocaleLowerCase().trim();
  const match = Object.entries(destinationFlags).find(([place]) =>
    name.includes(place),
  );
  return match?.[1] ?? "🌐";
}

function getBadgeVariant(value: string) {
  const normalized = value.toLocaleLowerCase();
  if (normalized.includes("luxury") || normalized.includes("premium")) {
    return "badge-gold";
  }
  if (normalized.includes("backpack") || normalized.includes("budget")) {
    return "badge-green";
  }
  if (normalized.includes("family") || normalized.includes("standard")) {
    return "badge-blue";
  }
  return "badge-coral";
}

export default function TripCard({ trip }: { trip: Trip }) {
  const travelStyle = trip.travel_style || trip.category;

  return (
    <article className="trip-history-card">
      <div className="trip-destination">
        <span
          aria-label={`Flag for ${trip.destination}`}
          className="destination-flag"
          role="img"
        >
          {getDestinationFlag(trip.destination)}
        </span>
        <div>
          <p className="trip-card-label">Destination</p>
          <h2>{trip.destination}</h2>
          <span className={`trip-badge ${getBadgeVariant(trip.category)}`}>
            {trip.category}
          </span>
        </div>
      </div>
      <dl className="trip-card-stats">
        <div>
          <dt>Budget</dt>
          <dd>{formatCurrency(trip.budget)}</dd>
        </div>
        <div>
          <dt>Days</dt>
          <dd>{trip.days}</dd>
        </div>
        <div>
          <dt>Daily budget</dt>
          <dd>{formatCurrency(trip.daily_budget)}</dd>
        </div>
        <div>
          <dt>Travel style</dt>
          <dd>
            <span className={`trip-badge ${getBadgeVariant(travelStyle)}`}>
              {travelStyle}
            </span>
          </dd>
        </div>
      </dl>
      <Link className="detail-button" href={`/trips/${trip.id}`}>
        Detail
      </Link>
    </article>
  );
}
