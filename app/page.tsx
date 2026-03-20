"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LayerConfig, useMapStore } from "@/store/mapStore";
import { useAuth } from "@/hooks/useAuth";
import LocationModal from "@/components/modals/LocationModal";
import { buscarCercanos } from "@/lib/utils/buscarCercanos";
import { toast } from "sonner";
import { NearbyStudentType } from "@/lib/types/nearbyStudentType";

// Componentes de Layout
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { MapControls } from "@/components/layout/MapControls";
import { Footer } from "@/components/layout/Footer";

// Importación dinámica del Mapa para evitar bloqueos en el hilo principal y errores de SSR (OpenLayers necesita la API `window`)
const Mapa = dynamic(() => import("@/components/Mapa"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm text-muted-foreground font-medium">Cargando mapa interactivo...</p>
    </div>
  ),
});

export default function HomePage() {
  const { user, loading } = useAuth();

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("layers");
  const [rightActiveSection, setRightActiveSection] = useState("info");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false);

  // Zustand
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
    (s) => s.updateNearbyStudentsLayer
  );
  const clearNearbyStudentsLayer = useMapStore((s) => s.clearNearbyStudentsLayer);

  const [nearbyResults, setNearbyResults] = useState<NearbyStudentType[]>([]);

  // Inicialización de ubicaciones del usuario
  useEffect(() => {
    if (user) {
      useMapStore.getState().setUser(user);
      useMapStore.getState().updateStudentLocationLayer(user);
    }
  }, [user]);

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

  function reorderLayers(newLayers: LayerConfig[]) {
    setLayers(newLayers);
  }

  const buscarEstudiantesCercanos = async () => {
    const ubicacionSeleccionada = featureValues;

    if (!ubicacionSeleccionada?.coord_x || !ubicacionSeleccionada?.coord_y) {
      toast.error("Ubicación no seleccionada", {
        description: "Por favor, selecciona una ubicación en el mapa primero.",
        duration: 4000,
      });
      return;
    }

    const x = Number.parseFloat(ubicacionSeleccionada.coord_x);
    const y = Number.parseFloat(ubicacionSeleccionada.coord_y);

    const loadingToast = toast.loading("Buscando estudiantes cercanos...");

    try {
      const resultados = await buscarCercanos(y, x);

      toast.dismiss(loadingToast);

      if (resultados && resultados.length > 0) {
        setNearbyResults(resultados);
        await updateNearbyStudentsLayer(resultados);

        toast.success("¡Búsqueda completada!", {
          description: `Se encontraron ${resultados.length} estudiante(s) cercano(s)`,
          duration: 5000,
        });

        // Abrir panel derecho para ver resultados y cambiar a stats
        if (isMobile) {
          setLeftSidebarOpen(false);
        }
        setRightSidebarOpen(true);
        setRightActiveSection("info");
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
    clearNearbyStudentsLayer();
    setNearbyResults([]);

    toast.success("Resultados limpiados", {
      description: "Los resultados de búsqueda han sido eliminados del mapa.",
      duration: 3000,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        user={user}
        loading={loading}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        isMobile={isMobile}
      />

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

        <LeftSidebar
          isMobile={isMobile}
          leftSidebarOpen={leftSidebarOpen}
          setLeftSidebarOpen={setLeftSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          checkUbicacion={checkUbicacion}
          setCheckUbicacion={setCheckUbicacion}
          layers={layers}
          toggleLayer={toggleLayer}
          setOpacity={setOpacity}
          reorderLayers={reorderLayers}
          featureValues={featureValues}
          buscarEstudiantesCercanos={buscarEstudiantesCercanos}
        />

        {/* Map Container */}
        <div className="flex-1 relative bg-muted">
          <main className="h-full">
            <Mapa />
          </main>

          <MapControls 
            isMobile={isMobile}
            mobileBottomPanelOpen={mobileBottomPanelOpen}
            setMobileBottomPanelOpen={setMobileBottomPanelOpen}
            lat={lat}
            lon={lon}
          />
        </div>

        <RightSidebar
          isMobile={isMobile}
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          rightActiveSection={rightActiveSection}
          setRightActiveSection={setRightActiveSection}
          nearbyResults={nearbyResults}
          limpiarResultadosCercanos={limpiarResultadosCercanos}
          featureValues={featureValues}
          user={user}
        />
      </div>

      <LocationModal />
      <Footer lat={lat} lon={lon} />
    </div>
  );
}
