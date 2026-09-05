"use client";

import { Coins, Mail, MapPinned } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import ChatbotFloat from "@/components/ChatbotFloat";
import Navbar from "@/components/Navbar";
import CreateTripFloat from "@/components/CreateTripFloat";
import { useEffect, useState } from "react";

type UserProfile = {
  name: string;
  email: string;
  total_trips: number;
  total_budget?: number | null;
};

function formatBudget(totalBudget: number | null | undefined) {
  if (typeof totalBudget !== "number" || !Number.isFinite(totalBudget)) {
    return "Belum tersedia";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(totalBudget);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    async function loadProfile() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/auth/me", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load profile.");
        }

        setProfile((await response.json()) as UserProfile);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <AuthGuard>
      <main className="profile-page">
        <div className="profile-shell">
          <Navbar backHref="/" backLabel="Home" />

          <header className="profile-header">
            <p className="profile-eyebrow">Your travel profile</p>
            <h1>Profile</h1>
            <p>Informasi akun dan perjalanan yang sudah kamu buat.</p>
          </header>

          {isLoading ? (
            <section className="profile-status" role="status">
              Memuat profil...
            </section>
          ) : hasError || !profile ? (
            <section
              className="profile-status profile-status-error"
              role="alert"
            >
              Profil belum dapat dimuat. Pastikan server Kelana AI sedang
              berjalan.
            </section>
          ) : (
            <section className="profile-content" aria-label="Profile details">
              <div className="profile-identity">
                <div className="profile-avatar" aria-hidden="true">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="profile-label">Account holder</p>
                  <h2>{profile.name}</h2>
                  <p className="profile-email">{profile.email}</p>
                </div>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <MapPinned aria-hidden="true" size={22} />
                  <div>
                    <p className="profile-label">Total trip generated</p>
                    <strong>{profile.total_trips}</strong>
                  </div>
                </div>
                <div className="profile-stat">
                  <Mail aria-hidden="true" size={22} />
                  <div>
                    <p className="profile-label">Email</p>
                    <strong>{profile.email}</strong>
                  </div>
                </div>
                <div className="profile-stat">
                  <Coins aria-hidden="true" size={22} />
                  <div>
                    <p className="profile-label">Total budget</p>
                    <strong>{formatBudget(profile.total_budget)}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
        <ChatbotFloat />
        <CreateTripFloat />
      </main>
    </AuthGuard>
  );
}
