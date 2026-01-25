"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface StatsResponse {
  success: boolean;
  data?: {
    totalStudents: number;
    byFacultad: { name: string; value: number }[];
    byCarrera: { name: string; value: number; facultad: string }[];
    byLocalidad: { name: string; value: number }[];
    recentRegistrations: { date: string; count: number }[];
    topLocalidades: { name: string; value: number }[];
  };
  error?: string;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Obtener todas las ubicaciones
    const { data: ubicaciones, error } = await supabase
      .from("ubicacionesdeestudiantes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!ubicaciones || ubicaciones.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalStudents: 0,
          byFacultad: [],
          byCarrera: [],
          byLocalidad: [],
          recentRegistrations: [],
          topLocalidades: [],
        },
      });
    }

    // Total de estudiantes
    const totalStudents = ubicaciones.length;

    // Agrupar por facultad
    const facultadCount = ubicaciones.reduce(
      (acc, ub) => {
        const key = ub.facultad || "Sin especificar";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byFacultad = Object.entries(facultadCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    // Agrupar por carrera (con facultad)
    const carreraCount = ubicaciones.reduce(
      (acc, ub) => {
        const key = ub.carrera || "Sin especificar";
        if (!acc[key]) {
          acc[key] = { count: 0, facultad: ub.facultad || "Sin especificar" };
        }
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { count: number; facultad: string }>,
    );

    const byCarrera = Object.entries(carreraCount)
      .map(([name, data]) => ({
        name,
        value: (data as { count: number; facultad: string }).count,
        facultad: (data as { count: number; facultad: string }).facultad,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 carreras

    // Agrupar por localidad
    const localidadCount = ubicaciones.reduce(
      (acc, ub) => {
        const key = ub.localidad || "Sin especificar";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byLocalidad = Object.entries(localidadCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    // Top 5 localidades para gráfico
    const topLocalidades = byLocalidad.slice(0, 5);

    // Registros recientes (últimos 7 días)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dateCount: Record<string, number> = {};

    // Inicializar los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dateCount[dateStr] = 0;
    }

    // Contar registros por día
    ubicaciones.forEach((ub) => {
      if (ub.created_at) {
        const createdDate = new Date(ub.created_at);
        if (createdDate >= sevenDaysAgo) {
          const dateStr = createdDate.toISOString().split("T")[0];
          if (dateCount[dateStr] !== undefined) {
            dateCount[dateStr] += 1;
          }
        }
      }
    });

    const recentRegistrations = Object.entries(dateCount)
      .map(([date, count]) => ({
        date: formatDate(date),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        byFacultad,
        byCarrera,
        byLocalidad,
        recentRegistrations,
        topLocalidades,
      },
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas",
      },
      { status: 500 },
    );
  }
}

// Formatear fecha a día/mes
function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}
