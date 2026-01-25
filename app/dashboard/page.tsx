import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { User, Calendar, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
          </div>
          <LogoutButton />
        </div>

        {/* User Info Card */}
        <div className="bg-card shadow-lg rounded-xl border border-border overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6">
            <div className="flex items-center gap-4">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user.user_metadata?.full_name || "Usuario"}
                </h2>
                <p className="text-white/80 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Información de la cuenta
            </h3>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    ID de usuario
                  </p>
                  <p className="text-foreground font-mono text-sm">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Último acceso
                  </p>
                  <p className="text-foreground font-medium">
                    {new Date(user.last_sign_in_at || "").toLocaleString(
                      "es-AR",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border hover:bg-accent transition-colors text-foreground"
          >
            <span>🗺️</span>
            <span className="font-medium">Ir al Mapa</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border hover:bg-accent transition-colors text-foreground"
          >
            <span>📍</span>
            <span className="font-medium">Ver mis ubicaciones</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
