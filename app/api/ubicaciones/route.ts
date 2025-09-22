"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Obtener la ubicación de un usuario por user_id
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id)
      return NextResponse.json(
        { success: false, error: "Falta el user_id" },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from("ubicacionesdeestudiantes")
      .select("*")
      .eq("user_id", user_id);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(
      "Error al Obtener la ubicación de un usuario por user_id:",
      err
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error al Obtener la ubicación de un usuario por user_id",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      user_id,
      localidad,
      facultad,
      carrera,
      profesion,
      lat,
      lon,
      email,
      nombre_completo,
    } = await req.json();

    const { data, error } = await supabase
      .from("ubicacionesdeestudiantes")
      .insert([
        {
          user_id,
          email,
          nombre_completo,
          localidad,
          facultad,
          carrera,
          profesion,
          lat,
          lon,
          created_by: user_id,
        },
      ]);

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error interno del servidor - POST:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor - POST" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, user_id, localidad, facultad, carrera, profesion, lat, lon } =
      await req.json();

    const { data, error } = await supabase
      .from("ubicacionesDeEstudiantes")
      .update({
        localidad,
        facultad,
        carrera,
        profesion,
        lat,
        lon,
        updated_at: new Date().toISOString(),
        updated_by: user_id,
      })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error interno del servidor - PATCH:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor - PATCH" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Falta el id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("ubicacionesdeestudiantes") // 👈 mismo nombre que en GET/POST
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Registro eliminado correctamente",
    });
  } catch (err) {
    console.error("Error interno del servidor - DELETE:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor - DELETE" },
      { status: 500 }
    );
  }
}
