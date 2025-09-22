import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GoogleLoginButton from "./GoogleLoginButton";
import { MapPin } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Contenedor principal */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Panel izquierdo - Branding */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-8 lg:p-12 flex flex-col justify-center text-white overflow-hidden">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
          </div>

          <div className="relative z-10">
            <img
              alt="conicet"
              src="https://ceregeo.github.io/Ceregeo/images/logoceregeo.png"
              className="bg-white p-2 rounded-lg mb-6 shadow-md w-auto"
            />

            {/* Contenido descriptivo */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight text-center">
                Accede al Centro Regional de Geomática
              </h2>

              <Link
                href="/"
                className="text-black flex items-center justify-center space-x-2 text-sm font-medium bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full px-4 py-2 w-max mx-auto shadow-md"
              >
                <MapPin className="w-4 h-4 " />
                <span>Visita nuestro sitio web</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Encabezado del formulario */}
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Bienvenido
              </h3>
              <p className="text-gray-600 text-lg">
                Inicia sesión para acceder a tu plataforma geográfica
              </p>
            </div>

            {/* Botón de Google Principal */}
            <div className="space-y-6">
              <GoogleLoginButton />

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Acceso seguro
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Utilizamos la autenticación de Google para garantizar la
                      máxima seguridad de tu cuenta y datos geográficos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlaces adicionales */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda para acceder?{" "}
                <button className="text-blue-600 hover:text-blue-500 font-medium">
                  Contactar soporte
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-sm text-gray-500">
          © 2025 CEREGEO. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
