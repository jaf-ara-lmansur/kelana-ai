"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NavbarProps = {
  backHref?: string;
  backLabel?: string;
  showHistory?: boolean;
  showNewTrip?: boolean;
};

type UserProfile = {
  id: number;
  name: string;
  email: string;
  total_trips?: number;
};

function notifySession(type: "expired" | "logout") {
  window.dispatchEvent(
    new CustomEvent("kelana:session-notice", { detail: { type } }),
  );
}

export default function Navbar({
  backHref,
  backLabel = "Back",
  showHistory = false,
  showNewTrip = false,
}: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      return;
    }

    async function loadUser() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) notifySession("expired");
          throw new Error("Unauthorized");
        }

        const data = (await response.json()) as UserProfile;
        setUser(data);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        setUser(null);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    notifySession("logout");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  }

  const avatarText = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  if (backHref || showHistory || showNewTrip) {
    return (
      <nav className="app-navbar" aria-label="Primary navigation">
        <Link className="history-brand" href="/">
          Kelana AI
        </Link>
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu-wrap">
              <button
                aria-expanded={menuOpen}
                className="user-menu-trigger"
                onClick={() => setMenuOpen((current) => !current)}
                type="button"
              >
                <span className="user-avatar">{avatarText}</span>
                <span className="user-name">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  <Link
                    className="dropdown-item"
                    href="/"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    className="dropdown-item"
                    href="/trips"
                    onClick={() => setMenuOpen(false)}
                  >
                    Trip history
                  </Link>
                  <Link
                    className="dropdown-item"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    className="dropdown-item"
                    href="/help"
                    onClick={() => setMenuOpen(false)}
                  >
                    Help
                  </Link>
                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                    type="button"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </nav>
    );
  }

  return (
    <nav className="landing-nav" aria-label="Main navigation">
      <div className="brand-wrap">
        <span className="brand-icon" aria-hidden="true">
          <span className="brand-icon-core" />
        </span>
        <Link className="brand-name" href="/">
          Kelana-Ai | Go Away
        </Link>
      </div>

      <div className="nav-links" aria-label="Primary menu">
        <Link href="/">Destinations</Link>
        <Link href="/">Travel Tips</Link>
        <Link href="/">Best Budget Travel</Link>
      </div>

      {user ? (
        <div className="user-menu-wrap">
          <button
            aria-expanded={menuOpen}
            className="user-menu-trigger"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <span className="user-avatar">{avatarText}</span>
            <span className="user-name">{user.name}</span>
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <Link
                className="dropdown-item"
                href="/"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                className="dropdown-item"
                href="/trips"
                onClick={() => setMenuOpen(false)}
              >
                Trip history
              </Link>
              <Link
                className="dropdown-item"
                href="/profile"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                className="dropdown-item"
                href="/help"
                onClick={() => setMenuOpen(false)}
              >
                Help
              </Link>
              <button
                className="dropdown-item danger"
                onClick={handleLogout}
                type="button"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-actions">
          <Link className="login-button" href="/login">
            Login
          </Link>
          <Link className="register-button" href="/register">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
