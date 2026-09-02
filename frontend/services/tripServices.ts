import type { Trip } from "@/types/trip";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchTripData(path: string): Promise<Trip | Trip[]> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    throw new Error("Unable to load trip history.");
  }

  return response.json() as Promise<Trip | Trip[]>;
}

export async function getTrips(): Promise<Trip[]> {
  return (await fetchTripData("/trips")) as Trip[];
}

export async function getTripById(id: number): Promise<Trip> {
  return (await fetchTripData(`/trips/${id}`)) as Trip;
}

export async function generateTripData(tripData: unknown) {
  const response = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(tripData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail ?? "Unable to generate your trip.");
  }

  return response.json();
}
