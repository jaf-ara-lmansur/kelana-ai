import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="travel-page">
      <div className="map-grid" aria-hidden="true" />
      <section className="travel-content">
        <Navbar showHistory />
        <section className="trip-panel">
          <header className="mb-10 text-center">
            <p className="eyebrow">Your next story starts here</p>
            <h1 className="home-title">Berkelana tanpa ragu.</h1>
            <p className="home-intro">
              Kelana AI merangkai perjalanan yang terasa personal, dari
              destinasi impian hingga itinerary yang siap kamu jalani.
            </p>
          </header>

          <div className="flex justify-center">
            <Link className="primary-button" href="/generate">
              Generate new trip
            </Link>
          </div>
        </section>
        <Footer />
      </section>
    </main>
  );
}
