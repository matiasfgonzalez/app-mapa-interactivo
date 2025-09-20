import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  // Nueva URL para extraer las facultades
  const url = "https://uader.edu.ar/facultades";

  try {
    const resp = await fetch(url);
    const html = await resp.text();
    const $ = cheerio.load(html);

    // Array para almacenar los nombres de las facultades
    const facultades: { id: string; nombre: string }[] = [];

    // La página lista las facultades en un `ul` con la clase ".item-list"
    // dentro de una sección con la clase ".elementor-widget-container"
    // Iteramos sobre cada elemento `li` dentro de esa lista.
    $(".elementor-widget-container .item-list li").each((_i, elem) => {
      // El nombre de la facultad está en el texto del enlace `<a>`
      const facultadNombre = $(elem).find("a").text().trim();

      if (facultadNombre) {
        facultades.push({
          id: facultadNombre,
          nombre: facultadNombre,
        });
      }
    });

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
