import type { Trip } from "@/types/trip";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

async function fetchTripData(path: string): Promise<Trip | Trip[]> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  });
  return response.json();
}
