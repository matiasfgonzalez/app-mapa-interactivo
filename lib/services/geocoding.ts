/**
 * Servicio de Geocoding usando Nominatim (OpenStreetMap)
 * API gratuita sin necesidad de API key
 * Rate limit: 1 request/segundo
 */

export interface GeocodingResult {
  placeId: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  boundingBox?: [number, number, number, number]; // [south, north, west, east]
}

interface NominatimResponse {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  boundingbox?: string[];
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Cache simple para evitar requests repetidos
const searchCache = new Map<string, GeocodingResult[]>();

/**
 * Busca ubicaciones por texto
 * @param query - Texto de búsqueda (ej: "Paraná, Entre Ríos")
 * @param options - Opciones de búsqueda
 * @returns Lista de resultados de geocoding
 */
export async function searchLocation(
  query: string,
  options: {
    limit?: number;
    countryCode?: string; // "ar" para Argentina
    viewbox?: [number, number, number, number]; // [west, south, east, north]
    bounded?: boolean;
  } = {},
): Promise<GeocodingResult[]> {
  const { limit = 5, countryCode = "ar", viewbox, bounded = false } = options;

  // Normalizar query para cache
  const cacheKey = `${query.toLowerCase().trim()}-${countryCode}-${limit}`;

  // Verificar cache
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: limit.toString(),
    countrycodes: countryCode,
  });

  if (viewbox) {
    params.append("viewbox", viewbox.join(","));
    if (bounded) {
      params.append("bounded", "1");
    }
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "CEREGEO-MapaInteractivo/1.0",
          "Accept-Language": "es",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data: NominatimResponse[] = await response.json();

    const results: GeocodingResult[] = data.map((item) => ({
      placeId: item.place_id.toString(),
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance,
      address: item.address,
      boundingBox: item.boundingbox
        ? (item.boundingbox.map(Number) as [number, number, number, number])
        : undefined,
    }));

    // Guardar en cache (máximo 100 entradas)
    if (searchCache.size > 100) {
      const firstKey = searchCache.keys().next().value;
      if (firstKey) searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, results);

    return results;
  } catch (error) {
    console.error("Error en geocoding:", error);
    return [];
  }
}

/**
 * Geocoding inverso: de coordenadas a dirección
 * @param lat - Latitud
 * @param lon - Longitud
 * @returns Resultado de geocoding o null
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: "json",
    addressdetails: "1",
  });

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`,
      {
        headers: {
          "User-Agent": "CEREGEO-MapaInteractivo/1.0",
          "Accept-Language": "es",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const data: NominatimResponse = await response.json();

    if (!data.lat || !data.lon) {
      return null;
    }

    return {
      placeId: data.place_id.toString(),
      displayName: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      type: data.type,
      importance: data.importance,
      address: data.address,
      boundingBox: data.boundingbox
        ? (data.boundingbox.map(Number) as [number, number, number, number])
        : undefined,
    };
  } catch (error) {
    console.error("Error en reverse geocoding:", error);
    return null;
  }
}

/**
 * Limpia el cache de búsquedas
 */
export function clearGeocodingCache(): void {
  searchCache.clear();
}

/**
 * Formatea el nombre de una ubicación de forma más legible
 */
export function formatLocationName(result: GeocodingResult): string {
  if (result.address) {
    const parts: string[] = [];

    const locality =
      result.address.city || result.address.town || result.address.village;
    if (locality) parts.push(locality);
    if (result.address.state) parts.push(result.address.state);
    if (result.address.country) parts.push(result.address.country);

    if (parts.length > 0) {
      return parts.join(", ");
    }
  }

  // Si no hay address, usar displayName pero acortado
  const parts = result.displayName.split(",").slice(0, 3);
  return parts.join(",").trim();
}
