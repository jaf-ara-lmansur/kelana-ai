"use client";

import { useState } from "react";
import TripList from "@/components/TripList";
import { deleteTrip, regenerateTrip, updateTrip } from "@/services/tripServices";
import type { Trip } from "@/types/trip";

type SortOption = "asc" | "desc" | "cheapest" | "most-expensive";
const TRIPS_PER_PAGE = 10;

export default function TripHistoryClient({ trips }: { trips: Trip[] }) {
  const [tripItems, setTripItems] = useState(trips);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editBudget, setEditBudget] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const categories = Array.from(
    new Set(tripItems.map((trip) => trip.category).filter(Boolean)),
  ).sort((first, second) => first.localeCompare(second));

  const visibleTrips = tripItems
    .filter((trip) => {
      const matchesDestination = trip.destination
        .toLocaleLowerCase()
        .includes(destinationQuery.toLocaleLowerCase().trim());
      const matchesCategory = category === "all" || trip.category === category;
      return matchesDestination && matchesCategory;
    })
    .sort((first, second) => {
      if (sort === "cheapest") return first.budget - second.budget;
      if (sort === "most-expensive") return second.budget - first.budget;
      const comparison = first.destination.localeCompare(second.destination);
      return sort === "asc" ? comparison : -comparison;
    });

  const pageCount = Math.ceil(visibleTrips.length / TRIPS_PER_PAGE);
  const safePage = pageCount === 0 ? 1 : Math.min(currentPage, pageCount);
  const paginatedTrips = visibleTrips.slice(
    (safePage - 1) * TRIPS_PER_PAGE,
    safePage * TRIPS_PER_PAGE,
  );

  function updateDestinationQuery(value: string) {
    setDestinationQuery(value);
    setCurrentPage(1);
  }

  function updateCategory(value: string) {
    setCategory(value);
    setCurrentPage(1);
  }

  function updateSort(value: SortOption) {
    setSort(value);
    setCurrentPage(1);
  }

  function resetFilters() {
    setDestinationQuery("");
    setCategory("all");
    setSort("asc");
    setCurrentPage(1);
  }

  function startEditing(trip: Trip) {
    setActionError("");
    setEditingTrip(trip);
    setEditBudget(String(trip.budget));
  }

  async function saveEdit() {
    if (!editingTrip || Number(editBudget) <= 0) return;
    setIsSaving(true);
    setActionError("");
    try {
      await updateTrip(editingTrip.id, {
        destination: editingTrip.destination,
        days: editingTrip.days,
        budget: Number(editBudget),
        travel_style: editingTrip.travel_style || editingTrip.category,
      });
      const updatedTrip = await regenerateTrip(editingTrip.id);
      setTripItems((currentTrips) =>
        currentTrips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)),
      );
      setEditingTrip(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Trip gagal diperbarui.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeTrip(trip: Trip) {
    if (!window.confirm(`Hapus trip ke ${trip.destination}?`)) return;
    setActionError("");
    try {
      await deleteTrip(trip.id);
      setTripItems((currentTrips) => currentTrips.filter((item) => item.id !== trip.id));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Trip gagal dihapus.");
    }
  }

  return (
    <>
      <section className="history-controls" aria-label="Search and sort trips">
        <div className="history-search-field">
          <label htmlFor="destination-search">Search destination</label>
          <input
            id="destination-search"
            onChange={(event) => updateDestinationQuery(event.target.value)}
            placeholder="e.g. Singapore"
            type="search"
            value={destinationQuery}
          />
        </div>
        <div className="history-select-field">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            onChange={(event) => updateCategory(event.target.value)}
            value={category}
          >
            <option value="all">All categories</option>
            {categories.map((tripCategory) => (
              <option key={tripCategory} value={tripCategory}>
                {tripCategory}
              </option>
            ))}
          </select>
        </div>
        <div className="history-select-field">
          <label htmlFor="trip-sort">Sort by</label>
          <select
            id="trip-sort"
            onChange={(event) => updateSort(event.target.value as SortOption)}
            value={sort}
          >
            <option value="asc">Destination: A to Z</option>
            <option value="desc">Destination: Z to A</option>
            <option value="cheapest">Budget: cheapest first</option>
            <option value="most-expensive">Budget: most expensive first</option>
          </select>
        </div>
      </section>

      {visibleTrips.length > 0 ? (
        <>
          <TripList onDelete={removeTrip} onEdit={startEditing} trips={paginatedTrips} />
          {pageCount > 1 && (
            <nav className="history-pagination" aria-label="Trip history pages">
              <button
                aria-label="Previous page"
                className="pagination-button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                type="button"
              >
                ←
              </button>
              <span>
                Page {safePage} of {pageCount}
              </span>
              <button
                aria-label="Next page"
                className="pagination-button"
                disabled={safePage === pageCount}
                onClick={() => setCurrentPage((page) => page + 1)}
                type="button"
              >
                →
              </button>
            </nav>
          )}
        </>
      ) : (
        <section className="empty-history filtered-empty" role="status">
          <span className="empty-compass" aria-hidden="true">
            ✦
          </span>
          <h2>Trip tidak ditemukan</h2>
          <p>Coba ubah destinasi atau kategori pencarianmu.</p>
          <button
            className="secondary-button"
            onClick={resetFilters}
            type="button"
          >
            Reset filters
          </button>
        </section>
      )}
      {actionError && <p className="trip-action-error" role="alert">{actionError}</p>}
      {editingTrip && (
        <div className="trip-modal-backdrop" role="presentation">
          <form
            className="trip-edit-modal"
            onSubmit={(event) => {
              event.preventDefault();
              void saveEdit();
            }}
          >
            <p className="trip-card-label">Edit trip</p>
            <h2>{editingTrip.destination}</h2>
            <label htmlFor="edit-budget">Budget</label>
            <input
              id="edit-budget"
              min="1"
              onChange={(event) => setEditBudget(event.target.value)}
              required
              type="number"
              value={editBudget}
            />
            <div className="trip-modal-actions">
              <button className="secondary-button" onClick={() => setEditingTrip(null)} type="button">
                Batal
              </button>
              <button className="primary-button" disabled={isSaving || Number(editBudget) <= 0} type="submit">
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
