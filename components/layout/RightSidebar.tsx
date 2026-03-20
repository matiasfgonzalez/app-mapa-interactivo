import { X, Info, Users, MapPin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsPanel } from "@/components/StatsPanel";
import { NearbyStudentType } from "@/lib/types/nearbyStudentType";
import { FeatureValues } from "@/lib/types/featureValues";
import { excludeKeys } from "@/lib/types/excludeKeys";

import { User } from "@supabase/supabase-js";

interface RightSidebarProps {
  isMobile: boolean;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  rightActiveSection: string;
  setRightActiveSection: (section: string) => void;
  nearbyResults: NearbyStudentType[];
  limpiarResultadosCercanos: () => void;
  featureValues: FeatureValues | null;
  user: User | null;
}

export function RightSidebar({
  isMobile,
  rightSidebarOpen,
  setRightSidebarOpen,
  rightActiveSection,
  setRightActiveSection,
  nearbyResults,
  limpiarResultadosCercanos,
  featureValues,
  user,
}: RightSidebarProps) {
  
  // Validaciones para botón eliminar
  const featureId = featureValues?.id || featureValues?.gid || featureValues?.objectid || "unknown";
  const featureName = (featureValues?.nombre as string) || "Región Seleccionada";
  const featureUserId = featureValues?.user_id || featureValues?.userid || featureValues?.usuario_id;
  const isOwnedByCurrentUser = !!(user && featureUserId && featureUserId === user.id);

  const handleEliminarSidebar = () => {
    // @ts-expect-error - Global API
    if (window.mapActions && window.mapActions.handleEliminar) {
      // @ts-expect-error
      window.mapActions.handleEliminar(featureId, featureName);
      setRightSidebarOpen(false); // Cerramos tras eliminar
    }
  };

  let displayJSON = "";
  if (featureValues) {
    try {
      const filteredObj: Record<string, unknown> = {};
      Object.entries(featureValues).forEach(([key, value]) => {
        if (!excludeKeys.has(key)) {
          filteredObj[key] = value;
        }
      });
      displayJSON = JSON.stringify(filteredObj, null, 2);
    } catch (e) {
      displayJSON = "Error parseando objeto";
    }
  }

  return (
    <div
      className={`bg-card border-l border-border transition-all duration-300 ease-out z-30 ${
        isMobile
          ? `fixed right-0 top-14 bottom-0 ${
              rightSidebarOpen ? "w-80 max-w-[85vw]" : "w-0"
            }`
          : rightSidebarOpen
            ? "w-96"
            : "w-0"
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {rightActiveSection === "info" ? "Información" : "Estadísticas"}
            </h2>
            <button
              onClick={() => setRightSidebarOpen(false)}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Right Sidebar Navigation */}
        <div className="border-b border-border">
          <nav className="flex">
            {[
              { id: "info", icon: Info, label: "Info" },
              { id: "stats", icon: BarChart3, label: "Estadísticas" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setRightActiveSection(item.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                  rightActiveSection === item.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Sidebar Content */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {rightActiveSection === "info" && (
            <div className="space-y-4">
              {/* Resultados de estudiantes cercanos */}
              {nearbyResults.length > 0 && (
                <div className="border border-primary/20 rounded-xl p-4 bg-primary/5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Estudiantes Cercanos ({nearbyResults.length})
                  </h3>
                  <div className="space-y-2">
                    {nearbyResults.map((estudiante, idx) => (
                      <div
                        key={estudiante.id || idx}
                        className="bg-card p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                      >
                        <p className="font-medium text-foreground">
                          {estudiante.nombre_completo}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Distancia: {(estudiante.distancia / 1000).toFixed(2)}{" "}
                          km
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                          {estudiante.lat.toFixed(6)},{" "}
                          {estudiante.lon.toFixed(6)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limpiarResultadosCercanos}
                    className="mt-3 w-full text-primary hover:text-primary"
                  >
                    Limpiar resultados
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {!featureValues && nearbyResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Haz clic en un punto del mapa para ver información
                  </p>
                </div>
              )}

              {featureValues && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground text-sm">
                    Objeto seleccionado
                  </h3>
                  <pre className="text-wrap text-xs bg-muted p-3 rounded-lg overflow-x-auto font-mono text-foreground">
                    {displayJSON}
                  </pre>
                  
                  {isOwnedByCurrentUser && (
                    <Button 
                      variant="destructive" 
                      onClick={handleEliminarSidebar}
                      className="w-full mt-4 bg-red-500 hover:bg-red-600 shadow-md flex items-center gap-2"
                    >
                      <X size={16} />
                      Eliminar mi ubicación
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {rightActiveSection === "stats" && <StatsPanel compact={isMobile} />}
        </div>
      </div>
    </div>
  );
}
