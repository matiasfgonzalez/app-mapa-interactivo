"use client";

import { useEffect, useState } from "react";
import Mapa from "@/components/Mapa";
import {
  Menu,
  X,
  Layers,
  Search,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchLocation } from "@/components/SearchLocation";
import { LayerData, useMapStore } from "@/store/mapStore";
import { NavigationMenuOptions } from "@/components/NavigationMenu";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/UserMenu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LocationModal from "@/components/modals/LocationModal";
import { excludeKeys } from "@/lib/types/excludeKeys";
import { Button } from "@/components/ui/button";
import { buscarCercanos } from "@/lib/utils/buscarCercanos";
import { toast } from "sonner";
import { NearbyStudentType } from "@/lib/types/nearbyStudentType";

export default function HomePage() {
  const { user, loading } = useAuth();

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("layers");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false);

  // Zustand
  const map = useMapStore((s) => s.map);
  const layers = useMapStore((s) => s.layers);
  const setLayers = useMapStore((s) => s.setLayers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const setOpacity = useMapStore((s) => s.setOpacity);
  const featureValues = useMapStore((s) => s.featureValues);
  const lon = useMapStore((s) => s.lon);
  const lat = useMapStore((s) => s.lat);
  const checkUbicacion = useMapStore((s) => s.checkUbicacion);
  const setCheckUbicacion = useMapStore((s) => s.setCheckUbicacion);
  const updateNearbyStudentsLayer = useMapStore(
    (s) => s.updateNearbyStudentsLayer,
  );

  const [nearbyResults, setNearbyResults] = useState<NearbyStudentType[]>([]);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setLeftSidebarOpen(true);
        setRightSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Cerrar sidebars cuando se abre el otro en mobile
  useEffect(() => {
    if (isMobile) {
      if (leftSidebarOpen) setRightSidebarOpen(false);
      if (rightSidebarOpen) setLeftSidebarOpen(false);
    }
  }, [leftSidebarOpen, rightSidebarOpen, isMobile]);

  function reorderLayers(newLayers: LayerData[]) {
    setLayers(newLayers);

    if (!map) return;

    map.getLayers().clear();

    for (const l of newLayers) {
      map.addLayer(l.layer);
    }
  }

  const buscarEstudiantesCercanos = async () => {
    const ubicacionSeleccionada = featureValues;
    console.log("Ubicación seleccionada:", ubicacionSeleccionada);

    if (!ubicacionSeleccionada?.coord_x || !ubicacionSeleccionada?.coord_y) {
      console.error("No se encontró una ubicación válida.");
      toast.error("Ubicación no seleccionada", {
        description: "Por favor, selecciona una ubicación en el mapa primero.",
        duration: 4000,
      });
      return;
    }

    // Extraer las coordenadas
    const x = Number.parseFloat(ubicacionSeleccionada.coord_x);
    const y = Number.parseFloat(ubicacionSeleccionada.coord_y);

    // Mostrar loading toast
    const loadingToast = toast.loading("Buscando estudiantes cercanos...");

    try {
      // Llamar a la función buscarCercanos con las coordenadas
      const resultados = await buscarCercanos(y, x);

      console.log("Resultados encontrados:", resultados);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (resultados && resultados.length > 0) {
        // Guardar resultados en el estado
        setNearbyResults(resultados);

        // Actualizar la capa en el mapa
        await updateNearbyStudentsLayer(resultados);

        toast.success("¡Búsqueda completada!", {
          description: `Se encontraron ${resultados.length} estudiante(s) cercano(s)`,
          duration: 5000,
        });
      } else {
        toast.info("Sin resultados", {
          description:
            "No se encontraron estudiantes cercanos a esta ubicación.",
          duration: 4000,
        });
        setNearbyResults([]);
      }
    } catch (error) {
      console.error("Error al buscar estudiantes cercanos:", error);
      toast.dismiss(loadingToast);
      toast.error("Error en la búsqueda", {
        description:
          "Ocurrió un error al buscar estudiantes cercanos. Por favor, intenta nuevamente.",
        duration: 5000,
      });
    }
  };

  const limpiarResultadosCercanos = () => {
    const { map, layers } = useMapStore.getState();

    // Remover la capa del mapa
    const layerIndex = layers.findIndex((l) => l.id === "estudiantes_cercanos");
    if (layerIndex !== -1 && map) {
      const layer = layers[layerIndex].layer;
      map.removeLayer(layer);
      layers.splice(layerIndex, 1);
    }

    // Limpiar resultados del estado
    setNearbyResults([]);

    toast.success("Resultados limpiados", {
      description: "Los resultados de búsqueda han sido eliminados del mapa.",
      duration: 3000,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border shadow-sm z-50 relative">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo y controles de sidebar */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => {
                  setLeftSidebarOpen(!leftSidebarOpen);
                  if (isMobile && rightSidebarOpen) setRightSidebarOpen(false);
                }}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-8 rounded-lg flex items-center justify-center">
                  <img
                    alt="CEREGEO Logo"
                    src="https://ceregeo.github.io/Ceregeo/images/logoceregeo.png"
                    className="dark:brightness-110"
                  />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground hidden sm:block">
                  CEREGEO
                </span>
              </div>
            </div>

            {/* Menú central - Solo visible en desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <NavigationMenuOptions />
            </div>

            {/* Controles derecha */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ThemeToggle />
              <UserMenu user={user} loading={loading} />
              <button
                onClick={() => {
                  setRightSidebarOpen(!rightSidebarOpen);
                  if (isMobile && leftSidebarOpen) setLeftSidebarOpen(false);
                }}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle info panel"
              >
                <Info size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay para mobile cuando hay sidebar abierto */}
        {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}

        {/* Left Sidebar */}
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
                          onCheckedChange={() =>
                            setCheckUbicacion(!checkUbicacion)
                          }
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
                        Activa esta opción y haz click en el mapa para registrar
                        tu ubicación.
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
                                Number.parseFloat(e.target.value),
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
                      Selecciona un punto en el mapa para buscar estudiantes en
                      esa zona.
                    </p>
                    <Button
                      className="w-full"
                      onClick={buscarEstudiantesCercanos}
                      disabled={
                        !featureValues?.coord_x || !featureValues?.coord_y
                      }
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

        {/* Map Container */}
        <div className="flex-1 relative bg-muted">
          <main className="h-full">
            <Mapa />
          </main>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              className="bg-card p-2.5 rounded-lg shadow-md hover:shadow-lg border border-border text-muted-foreground hover:text-foreground transition-all"
              title="Descargar mapa"
            >
              <Download size={18} />
            </button>
            <button
              className="bg-card p-2.5 rounded-lg shadow-md hover:shadow-lg border border-border text-muted-foreground hover:text-foreground transition-all"
              title="Compartir"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Mobile Bottom Panel Toggle */}
          {isMobile && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setMobileBottomPanelOpen(!mobileBottomPanelOpen)}
                className="bg-card p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-border"
              >
                {mobileBottomPanelOpen ? (
                  <ChevronDown size={20} className="text-foreground" />
                ) : (
                  <ChevronUp size={20} className="text-foreground" />
                )}
              </button>
            </div>
          )}

          {/* Mobile Bottom Panel */}
          {isMobile && (
            <div
              className={`absolute bottom-0 left-0 right-0 bg-card border-t border-border transition-transform duration-300 ${
                mobileBottomPanelOpen
                  ? "transform translate-y-0"
                  : "transform translate-y-full"
              }`}
            >
              <div className="p-4 max-h-60 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Coordenadas seleccionadas
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-primary/10 p-2 rounded-lg text-center">
                        <div className="text-lg font-bold text-primary font-mono">
                          {lat?.toFixed(4) || "--"}
                        </div>
                        <div className="text-xs text-primary/70">Latitud</div>
                      </div>
                      <div className="bg-primary/10 p-2 rounded-lg text-center">
                        <div className="text-lg font-bold text-primary font-mono">
                          {lon?.toFixed(4) || "--"}
                        </div>
                        <div className="text-xs text-primary/70">Longitud</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
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
                  Información
                </h2>
                <button
                  onClick={() => setRightSidebarOpen(false)}
                  className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4">
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
                    {JSON.stringify(
                      featureValues,
                      (key, value) =>
                        excludeKeys.has(key) ? undefined : value,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LocationModal />

      {/* Footer */}
      <footer className="bg-card border-t border-border px-4 py-2 hidden md:block">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2026 CEREGEO</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidad
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">
              {lat?.toFixed(6) || "--"}, {lon?.toFixed(6) || "--"}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Conectado</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
