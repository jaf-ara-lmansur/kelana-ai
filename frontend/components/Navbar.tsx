import Link from "next/link";

type NavbarProps = {
  backHref?: string;
  backLabel?: string;
  showHistory?: boolean;
  showNewTrip?: boolean;
};

export default function Navbar({
  backHref,
  backLabel = "Back",
  showHistory = false,
  showNewTrip = false,
}: NavbarProps) {
  return (
    <nav className="app-navbar" aria-label="Primary navigation">
      <Link className="history-brand" href="/">
        Kelana AI
      </Link>
      <div className="navbar-actions">
        {showNewTrip && (
          <Link className="new-trip-button" href="/">
            + New trip
          </Link>
        )}
        {showHistory && (
          <Link className="secondary-button" href="/trips">
            Trip history
          </Link>
        )}
        {backHref && (
          <Link className="back-link" href={backHref}>
            ← {backLabel}
          </Link>
        )}
      </div>
    </nav>
  );
}
