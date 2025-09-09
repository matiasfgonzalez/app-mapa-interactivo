"use client";

import { useEffect, useState } from "react";
import Mapa from "@/components/Mapa";
import Resultados from "@/components/Resultados";
import {
  Menu,
  X,
  Layers,
  Settings,
  Search,
  Filter,
  Download,
  Share,
  ChevronDown,
  Bell,
  User,
  Globe,
  ChevronUp,
} from "lucide-react";
import { useMapStore } from "@/store/mapStore";

export default function HomePage() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false); // Cerrado por defecto en mobile
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false); // Cerrado por defecto en mobile
  const [activeSection, setActiveSection] = useState("layers");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileBottomPanelOpen, setMobileBottomPanelOpen] = useState(false);

  // Zustand
  const layers = useMapStore((s) => s.layers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const setOpacity = useMapStore((s) => s.setOpacity);
  const selectedRegion = useMapStore((s) => s.selectedRegion);
  const featureValues = useMapStore((s) => s.featureValues);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // En desktop, abrir sidebars por defecto
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

  const resultados: Record<string, any> = {
    region1: {
      nombre: "Sección 1",
      votos: [
        { partido: "Fuerza Patria", porcentaje: 47.28 },
        { partido: "La Libertad Avanza", porcentaje: 33.71 },
      ],
    },
    region2: {
      nombre: "Sección 2",
      votos: [
        { partido: "Fuerza Patria", porcentaje: 40.0 },
        { partido: "La Libertad Avanza", porcentaje: 45.0 },
      ],
    },
    region3: {
      nombre: "Sección 3",
      votos: [
        { partido: "Fuerza Patria", porcentaje: 30.0 },
        { partido: "La Libertad Avanza", porcentaje: 50.0 },
      ],
    },
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm z-50 relative">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo y controles de sidebar */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => {
                  setLeftSidebarOpen(!leftSidebarOpen);
                  if (isMobile && rightSidebarOpen) setRightSidebarOpen(false);
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="text-white" size={14} />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-gray-900 hidden xs:block">
                  GeoAnalytics
                </span>
              </div>
            </div>

            {/* Menú central - Solo visible en desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Mapas
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Análisis
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Reportes
              </a>
            </div>

            {/* Controles derecha */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                <Bell size={18} />
              </button>
              <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                <ChevronDown size={14} className="hidden sm:block" />
              </button>
              <button
                onClick={() => {
                  setRightSidebarOpen(!rightSidebarOpen);
                  if (isMobile && leftSidebarOpen) setLeftSidebarOpen(false);
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings size={18} />
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
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}

        {/* Left Sidebar */}
        <div
          className={`bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
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
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Panel de Control
                </h2>
                <button
                  onClick={() => setLeftSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-0">
                {[
                  { id: "layers", icon: Layers, label: "Capas" },
                  { id: "search", icon: Search, label: "Buscar" },
                  { id: "filter", icon: Filter, label: "Filtros" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
              {activeSection === "layers" && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Capas Disponibles
                  </h3>
                  {/* Layers Section */}
                  <div className="flex-1 p-1 overflow-y-auto">
                    {activeSection === "layers" && (
                      <div className="space-y-4">
                        {layers.map((layer) => (
                          <div
                            key={layer.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={layer.visible}
                                  onChange={(e) =>
                                    toggleLayer(layer.id, e.target.checked)
                                  }
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="text-sm font-medium">
                                  {layer.title}
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
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
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="text-xs text-gray-500 w-10">
                                {Math.round(layer.opacity * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "search" && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Buscar Ubicación
                  </h3>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Buscar lugares, coordenadas..."
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">
                      Búsquedas Recientes
                    </h4>
                    {["Buenos Aires", "Córdoba", "Mendoza"].map(
                      (place, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        >
                          {place}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeSection === "filter" && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Filtros de Datos
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Región
                      </label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Todas las regiones</option>
                        <option>Buenos Aires</option>
                        <option>Córdoba</option>
                        <option>Santa Fe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Período
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100">
          <main className="h-full flex gap-4 bg-gray-100">
            <div className="w-full">
              <Mapa />
            </div>
          </main>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <button className="bg-white p-2 rounded-lg shadow hover:shadow-md transition-shadow">
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button className="bg-white p-2 rounded-lg shadow hover:shadow-md transition-shadow">
              <Share size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* Map Scale/Info */}
          <div className="absolute bottom-4 left-4 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow text-xs sm:text-sm">
            Escala: 1:50000
          </div>

          {/* Mobile Bottom Panel Toggle */}
          {isMobile && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setMobileBottomPanelOpen(!mobileBottomPanelOpen)}
                className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                {mobileBottomPanelOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronUp size={20} />
                )}
              </button>
            </div>
          )}

          {/* Mobile Bottom Panel */}
          {isMobile && (
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 transition-transform duration-300 ${
                mobileBottomPanelOpen
                  ? "transform translate-y-0"
                  : "transform translate-y-full"
              }`}
            >
              <div className="p-4 max-h-60 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Información Rápida
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">
                          1.2M
                        </div>
                        <div className="text-xs text-blue-700">Población</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">
                          85%
                        </div>
                        <div className="text-xs text-green-700">Cobertura</div>
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
          className={`bg-white border-l border-gray-200 transition-all duration-300 z-30 ${
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
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Información
                </h2>
                <button
                  onClick={() => setRightSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 sm:space-y-6">
              {selectedRegion ? (
                <Resultados data={resultados[selectedRegion]} />
              ) : (
                <p className="text-gray-500">
                  Haz clic en una región para ver resultados
                </p>
              )}
              {featureValues && (
                <div>
                  <p className="font-bold">Objeto seleccionado</p>
                  <pre className="text-wrap text-xs bg-gray-100 p-2 rounded">
                    {/* Creamos una copia del objeto para no modificar el original */}
                    {JSON.stringify(
                      // Destructuring para copiar el objeto y excluir 'geometry'
                      { ...featureValues, geometry: undefined },
                      (key, value) => (key === "geometry" ? undefined : value),
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Oculto en mobile */}
      <footer className="bg-white border-t border-gray-200 px-3 sm:px-4 py-2 sm:py-3 hidden sm:block">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span>© 2025 GeoAnalytics</span>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacidad
            </a>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden md:block">
              Coordenadas: -34.6118, -58.3960
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Conectado</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
