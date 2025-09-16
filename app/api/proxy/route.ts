import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    // Llamamos al servicio externo
    const response = await fetch(url);

    // Reenviamos el contenido (puede ser JSON, XML, imagen, etc.)
    const contentType = response.headers.get("content-type") || "text/plain";
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Error fetching external URL", { status: 500 });
  }
}
