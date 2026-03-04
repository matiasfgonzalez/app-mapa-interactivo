"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ngeohash from "ngeohash";
import { toLonLat } from "ol/proj";
import type { NearbyStudentType } from "@/lib/types/nearbyStudentType";

import { nearbySchema } from "@/lib/schemas/ubicacionSchema";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const parsedParams = {
      lat: searchParams.get("lat"),
      lon: searchParams.get("lon"),
    };

    const result = nearbySchema.safeParse(parsedParams);

    if (!result.success) {
      return NextResponse.json(
        { error: "Debe enviar parámetros válidos: lat y lon numéricos" },
        { status: 400 }
      );
    }

    const { lat: latParam, lon: lonParam } = result.data;

    let lat: number;
    let lon: number;

    // 🔎 Detectar sistema de coordenadas
    if (
      latParam >= -90 &&
      latParam <= 90 &&
      lonParam >= -180 &&
      lonParam <= 180
    ) {
      // ✅ EPSG:4326 (grados)
      lat = latParam;
      lon = lonParam;
    } else {
      // 🗺️ EPSG:3857 (metros) → convertir
      [lon, lat] = toLonLat([lonParam, latParam], "EPSG:3857");
    }

    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: "Coordenadas detectadas fuera del rango válido de la proyección (EPSG:4326)" },
        { status: 400 }
      );
    }

    // 1️⃣ Generar geohash del punto actual
    const precision = 4; // nivel de detalle (~20 km aprox)
    const currentHash = ngeohash.encode(lat, lon, precision);

    // 2️⃣ Prefijo de búsqueda (zona cercana)
    const prefix = currentHash.substring(0, 5);

    // 3️⃣ Buscar en Supabase los registros cuyo geohash empiece igual
    const { data, error } = await supabase
      .from("ubicacionesdeestudiantes")
      .select("id, nombre_completo, lat, lon, geohash")
      .ilike("geohash", `${prefix}%`);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4️⃣ Calcular distancia (Haversine)
    const R = 6371e3; // radio de la Tierra en metros
    const lugaresConDistancia: NearbyStudentType[] = data.map((item) => {
      const φ1 = (lat * Math.PI) / 180;
      const φ2 = (item.lat * Math.PI) / 180;
      const Δφ = ((item.lat - lat) * Math.PI) / 180;
      const Δλ = ((item.lon - lon) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distancia = R * c;
      return { ...item, distancia };
    });

    // 5️⃣ Ordenar por distancia ascendente
    lugaresConDistancia.sort((a, b) => a.distancia - b.distancia);

    return NextResponse.json({
      count: lugaresConDistancia.length,
      results: lugaresConDistancia.slice(0, 20),
    });
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
