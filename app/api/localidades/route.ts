import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ejemplo: todas las localidades (máx. 5000)
    const res = await fetch(
      "https://apis.datos.gob.ar/georef/api/localidades?max=5000"
    );

    if (!res.ok) {
      throw new Error("Error al obtener localidades");
    }

    const data = await res.json();

    return NextResponse.json(data.localidades);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las localidades" },
      { status: 500 }
    );
  }
}
