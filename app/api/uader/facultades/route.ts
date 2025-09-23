import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Array para almacenar los nombres de las facultades
    const facultades: { id: string; nombre: string }[] = [];

    /* Se comenta el retorno de todas las facultadas 
    facultades.push(
      {
        id: "FCG",
        nombre: "FCG - Facultad de Ciencias de la Gestión",
      },
      {
        id: "FCyT",
        nombre: "FCyT - Facultad de Ciencia y Tecnología",
      },
      {
        id: "FCVyS",
        nombre: "FCVyS - Facultad de Ciencias de la Vida y la Salud",
      },
      {
        id: "FHAyCS",
        nombre: "FHAyCS - Facultad de Humanidades, Artes y Ciencias Sociales",
      }
    );
    */

    facultades.push({
      id: "FCyT",
      nombre: "FCyT - Facultad de Ciencia y Tecnología",
    });

    // Retorna la respuesta como un JSON
    return NextResponse.json({ facultades });
  } catch (error) {
    console.error("Error scraping UADER:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos de las facultades." },
      { status: 500 }
    );
  }
}
