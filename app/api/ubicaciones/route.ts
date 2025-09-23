"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Obtener la ubicación de un usuario por user_id
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    const supabase = await createClient();

    if (user_id) {
      const { data, error } = await supabase
        .from("ubicacionesdeestudiantes")
        .select("*")
        .eq("user_id", user_id);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // ✅ Si no pasás user_id → trae todas
    const { data, error } = await supabase
      .from("ubicacionesdeestudiantes")
      .select("*");

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
    const supabase = await createClient();

    const {
      localidad,
      facultad,
      carrera,
      profesion,
      lat,
      lon,
      email,
      nombre_completo,
    } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No hay usuario logueado");

    const { data, error } = await supabase
      .from("ubicacionesdeestudiantes")
      .insert([
        {
          user_id: user.id,
          email,
          nombre_completo,
          localidad,
          facultad,
          carrera,
          profesion,
          lat,
          lon,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          created_by: user.id,
        },
      ])
      .select();

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
    const supabase = await createClient();
    const { id, user_id, localidad, facultad, carrera, profesion, lat, lon } =
      await req.json();

    const { data, error } = await supabase
      .from("ubicacionesdeestudiantes")
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
      .eq("id", id)
      .select();

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
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Falta el id de la ubicación" },
        { status: 400 }
      );
    }

    // Obtener el usuario autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No hay usuario logueado" },
        { status: 401 }
      );
    }

    // Verificar que el registro pertenece al usuario
    const { data: record, error: fetchError } = await supabase
      .from("ubicacionesdeestudiantes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { success: false, error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    if (record.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado para eliminar este registro" },
        { status: 403 }
      );
    }

    // Solo el dueño puede eliminar
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
