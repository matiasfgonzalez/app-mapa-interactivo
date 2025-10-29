export interface NearbyStudentType {
  id: string;
  nombre_completo: string;
  lat: number;
  lon: number;
  distancia: number;
  geohash?: string;
}

export interface NearbySearchResponse {
  count: number;
  results: NearbyStudentType[];
}
