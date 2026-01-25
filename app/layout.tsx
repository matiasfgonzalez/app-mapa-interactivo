import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEREGEO - Centro Regional de Geomática",
  description:
    "Sistema de mapeo geoespacial colaborativo para estudiantes universitarios. Visualiza datos geoespaciales, registra tu ubicación y conecta con compañeros cercanos.",
  keywords: [
    "geomática",
    "mapa interactivo",
    "estudiantes universitarios",
    "UADER",
    "geolocalización",
    "Argentina",
  ],
  authors: [{ name: "CEREGEO" }],
  openGraph: {
    title: "CEREGEO - Centro Regional de Geomática",
    description: "Sistema de mapeo geoespacial colaborativo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              className: "dark:bg-card dark:text-card-foreground",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
