"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTripFloat() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  function handleCreateTrip() {
    if (isNavigating) return;

    setIsNavigating(true);
    window.setTimeout(() => router.push("/generate"), 450);
  }

  return (
    <>
      <button
        aria-label="Create a new trip"
      className="create-trip-float"
      title="Create a new trip"
        onClick={handleCreateTrip}
        type="button"
    >
        <Plus aria-hidden="true" size={20} />
        <span>Create trip</span>
      </button>

      {isNavigating && (
        <div className="page-transition-overlay" role="status" aria-live="polite">
          <div className="page-transition-card">
            <span className="page-transition-icon" aria-hidden="true">
              <Plus size={24} />
            </span>
            <span className="page-transition-title">Preparing your trip</span>
            <span className="page-transition-skeleton page-transition-skeleton-wide" />
            <span className="page-transition-skeleton page-transition-skeleton-medium" />
            <span className="page-transition-skeleton page-transition-skeleton-short" />
          </div>
        </div>
      )}
    </>
  );
}
