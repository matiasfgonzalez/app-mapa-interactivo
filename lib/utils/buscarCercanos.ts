import type { NearbySearchResponse } from "@/lib/types/nearbyStudentType";

export const buscarCercanos = async (lat: number, lon: number) => {
  const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}`);
  const json: NearbySearchResponse = await res.json();
  return json.results;
};
