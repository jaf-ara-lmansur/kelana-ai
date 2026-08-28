import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Daycards from "@/components/Daycards";
import Navbar from "@/components/Navbar";
import { getTripById } from "@/services/tripServices";

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

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTripById(Number(id)).catch(() => null);
  if (!trip) notFound();

  return (
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
      </div>
    </main>
  );
}
