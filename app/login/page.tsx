import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GoogleLoginButton from "./GoogleLoginButton";
import { MapPin, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-background dark:via-background dark:to-primary/5 flex items-center justify-center p-4">
      {/* Contenedor principal */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Panel izquierdo - Branding */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-8 lg:p-12 flex flex-col justify-center text-white overflow-hidden">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
          </div>

          <div className="relative z-10">
            <img
              alt="CEREGEO Logo"
              src="https://ceregeo.github.io/Ceregeo/images/logoceregeo.png"
              className="bg-white p-3 rounded-xl mb-8 shadow-lg w-auto max-w-[200px]"
            />

            {/* Contenido descriptivo */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Centro Regional de Geomática
              </h2>
              <p className="text-white/80 text-lg">
                Plataforma de mapeo geoespacial colaborativo para la comunidad
                académica.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-5 py-2.5 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Explorar el mapa</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-card">
          <div className="max-w-md mx-auto w-full">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Volver al mapa</span>
            </Link>

            {/* Encabezado del formulario */}
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-foreground mb-3">
                Bienvenido
              </h3>
              <p className="text-muted-foreground text-lg">
                Inicia sesión para acceder a tu plataforma geográfica
              </p>
            </div>

            {/* Botón de Google Principal */}
            <div className="space-y-6">
              <GoogleLoginButton />

              {/* Información adicional */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Acceso seguro
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Utilizamos la autenticación de Google para garantizar la
                      máxima seguridad de tu cuenta y datos geográficos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlaces adicionales */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Necesitas ayuda para acceder?{" "}
                <button className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Contactar soporte
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
