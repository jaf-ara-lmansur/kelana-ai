import Link from "next/link";

export default function TripNotFound() {
  return (
    <main className="history-page">
      <section className="empty-history standalone-empty" role="status">
        <span className="empty-compass" aria-hidden="true">
          ✦
        </span>
        <p className="eyebrow">Kelana AI</p>
        <h1>Trip tidak ditemukan</h1>
        <p>Trip ini mungkin sudah dihapus atau belum pernah tersimpan.</p>
        <div className="empty-actions">
          <Link className="secondary-button" href="/trips">
            Back to history
          </Link>
          <Link className="primary-button" href="/generate">
            Generate new trip
          </Link>
        </div>
      </section>
    </main>
  );
}
