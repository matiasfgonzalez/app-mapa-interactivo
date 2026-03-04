import { X, Layers, Search, MapPin, Users, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchLocation } from "@/components/SearchLocation";
import { LayerConfig } from "@/store/mapStore";
import { User } from "@supabase/supabase-js";
import { NearbyStudentType } from "@/lib/types/nearbyStudentType";
import { FeatureValues } from "@/lib/types/featureValues";
import { ChevronUp, ChevronDown } from "lucide-react";

interface LeftSidebarProps {
  isMobile: boolean;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: User | null;
  checkUbicacion: boolean;
  setCheckUbicacion: (check: boolean) => void;
  layers: LayerConfig[];
  toggleLayer: (id: string, visible: boolean) => void;
  setOpacity: (id: string, opacity: number) => void;
  reorderLayers: (newLayers: LayerConfig[]) => void;
  featureValues: FeatureValues | null;
  buscarEstudiantesCercanos: () => Promise<void>;
}

export function LeftSidebar({
  isMobile,
  leftSidebarOpen,
  setLeftSidebarOpen,
  activeSection,
  setActiveSection,
  user,
  checkUbicacion,
  setCheckUbicacion,
  layers,
  toggleLayer,
  setOpacity,
  reorderLayers,
  featureValues,
  buscarEstudiantesCercanos,
}: LeftSidebarProps) {
  return (
    <div
      className={`bg-card border-r border-border transition-all duration-300 ease-out z-30 ${
        isMobile
          ? `fixed left-0 top-14 bottom-0 ${
              leftSidebarOpen ? "w-80 max-w-[85vw]" : "w-0"
            }`
          : leftSidebarOpen
            ? "w-80"
            : "w-0"
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Panel de Control
            </h2>
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="border-b border-border">
          <nav className="flex">
            {[
              { id: "layers", icon: Layers, label: "Capas" },
              { id: "search", icon: Search, label: "Buscar" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                  activeSection === item.id
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

        {/* Sidebar Content */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {activeSection === "layers" && (
            <div className="space-y-4">
              {user && (
                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  {/* Encabezado */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">
                      Declarar ubicación
                    </h3>
                  </div>

                  {/* Checkbox + Label */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ubicacion"
                      checked={checkUbicacion}
                      onCheckedChange={() => setCheckUbicacion(!checkUbicacion)}
                    />
                    <Label
                      htmlFor="ubicacion"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Habilitar selección en el mapa
                    </Label>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Activa esta opción y haz click en el mapa para registrar tu
                    ubicación.
                  </p>
                </div>
              )}

              <h3 className="font-medium text-foreground text-sm">
                Capas Disponibles
              </h3>

              {/* Layers List */}
              <div className="space-y-3">
                {layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={(e) =>
                            toggleLayer(layer.id, e.target.checked)
                          }
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {layer.title}
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">
                        Opacidad:
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={layer.opacity}
                        onChange={(e) =>
                          setOpacity(
                            layer.id,
                            Number.parseFloat(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>

                    {/* Flechas para mover capas */}
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          if (index === 0) return;
                          const newLayers = [...layers];
                          [newLayers[index - 1], newLayers[index]] = [
                            newLayers[index],
                            newLayers[index - 1],
                          ];
                          reorderLayers(newLayers);
                        }}
                        disabled={index === 0}
                        className="p-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Mover arriba"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (index === layers.length - 1) return;
                          const newLayers = [...layers];
                          [newLayers[index], newLayers[index + 1]] = [
                            newLayers[index + 1],
                            newLayers[index],
                          ];
                          reorderLayers(newLayers);
                        }}
                        disabled={index === layers.length - 1}
                        className="p-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Mover abajo"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "search" && (
            <div className="space-y-4">
              {/* Búsqueda de estudiantes cercanos */}
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Estudiantes Cercanos
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecciona un punto en el mapa para buscar estudiantes en esa
                  zona.
                </p>
                <Button
                  className="w-full"
                  onClick={buscarEstudiantesCercanos}
                  disabled={!featureValues?.coord_x || !featureValues?.coord_y}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar cercanos
                </Button>
                {!featureValues?.coord_x && (
                  <div className="mt-3 p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Primero haz clic en un punto del mapa.
                    </p>
                  </div>
                )}
              </div>

              {/* Búsqueda de ubicación */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground text-sm">
                  Buscar Ubicación
                </h3>
                <SearchLocation placeholder="Buscar ciudad, dirección..." />
                <p className="text-xs text-muted-foreground">
                  Escribe al menos 3 caracteres para buscar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
