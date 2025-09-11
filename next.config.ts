import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/geoserver/:path*",
        destination: "https://geoservicios.entrerios.gov.ar/geoserver/:path*",
      },
    ];
  },
};

export default nextConfig;
