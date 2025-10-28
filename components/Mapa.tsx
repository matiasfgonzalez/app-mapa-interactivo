"use client";

import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Style, Fill, Stroke } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import { useMapStore } from "@/store/mapStore";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import CircleStyle from "ol/style/Circle";
import {
  baseLayer,
  fetchUbicacionesDelEstudiante,
  uniUaderLayer,
} from "@/lib/const/layers";
import { useAuth } from "@/hooks/useAuth";
import Overlay from "ol/Overlay";
import { toast } from "sonner";
import { FeatureValues } from "@/lib/types/featureValues";
import { excludeKeys } from "@/lib/types/excludeKeys";
import { buscarCercanos } from "@/lib/utils/buscarCercanos";

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const setMap = useMapStore((s) => s.setMap);
  const map = useMapStore((s) => s.map);
  const setLayers = useMapStore((s) => s.setLayers);
  const layers = useMapStore((s) => s.layers);
  const setSelectedRegion = useMapStore((s) => s.setSelectedRegion);
  const setFeatureValues = useMapStore((s) => s.setFeatureValues);

  const setCoordinate = useMapStore((s) => s.setCoordinate);
  const setModalOpen = useMapStore((s) => s.setModalOpen);

  const lon = useMapStore((s) => s.lon);
  const lat = useMapStore((s) => s.lat);

  const setUser = useMapStore((s) => s.setUser);

  const { user } = useAuth();

  // Función para cerrar popup
  const closePopup = (popupElement: HTMLElement, popupOverlay: Overlay) => {
    popupElement.style.display = "none";
    popupOverlay.setPosition(undefined);
    popupElement.classList.add("hidden");
  };

  // Función para manejar la eliminación
  const handleEliminar = async (featureId: string, featureName: string) => {
    try {
      const map = useMapStore.getState().map; // 👈 siempre el valor actualizado
      if (!featureId || featureId === "unknown")
        return toast.error("Este dato no se puede eliminar");

      const res = await fetch(`/api/ubicaciones?id=${featureId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.status === 403) {
        toast.error(result.error || "No autorizado");
        return;
      }

      if (!res.ok) throw new Error(result.error || "Error al eliminar");

      const user = useMapStore.getState().user;
      const vectorLayer = await fetchUbicacionesDelEstudiante(user!);

      // Agregar la capa al mapa
      map.addLayer(vectorLayer);

      const layers = useMapStore.getState().layers;
      // Validar si ya existe una layer similar, eliminarla para evitar duplicados
      const existingIndex = layers.findIndex(
        (l) => l.id === "ubicacion_estudiante"
      );
      if (existingIndex !== -1) {
        const existingLayer = layers[existingIndex].layer;
        map.removeLayer(existingLayer);
        layers.splice(existingIndex, 1); // Eliminar del estado
      }

      layers.push({
        id: "ubicacion_estudiante",
        title: "Mi Ubicación",
        visible: true,
        opacity: 1,
        layer: vectorLayer,
      });

      const popupElement = document.getElementById("popup") as HTMLElement;

      const popupOverlay = map.getOverlayById("popup_overlay") as Overlay;
      closePopup(popupElement, popupOverlay);

      toast.success(`Ubicación eliminada correctamente`);
      return result;
    } catch (err) {
      console.error("Error eliminando ubicación:", err);
      throw err;
    }
  };

  // Función para crear contenido del popup mejorado
  const createPopupContent = (
    values: FeatureValues,
    popupElement: HTMLElement,
    popupOverlay: Overlay
  ) => {
    const featureId = values.id || values.gid || values.objectid || "unknown";
    const featureName = (values.nombre as string) || "Región Seleccionada";

    return `
      <div class="popup-container">
        <!-- Header del popup -->
        <div class="popup-header">
          <h3 class="popup-title">${featureName}</h3>
          <button class="popup-close" onclick="document.getElementById('popup').style.display='none'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Contenido con scroll -->
        <div class="popup-content">
          ${Object.entries(values)
            .filter(([key]) => !excludeKeys.has(key))
            .map(
              ([key, val]) => `
              <div class="popup-item">
                <span class="popup-label">${
                  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
                }:</span>
                <span class="popup-value">${val || "N/A"}</span>
              </div>
            `
            )
            .join("")}
        </div>
        
        <!-- Botones de acción -->
        <div class="popup-actions">
          <button 
            class="popup-btn popup-btn-delete" 
            onclick="window.mapInstance?.handleEliminar('${featureId}', '${featureName.replace(
      /'/g,
      "\\'"
    )}')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2V6"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Crear mapa
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, uniUaderLayer],
      view: new View({
        center: fromLonLat([-59, -32]),
        zoom: 7,
      }),
    });

    // Guardar referencia global del mapa y capas en Zustand
    setMap(map);

    // Exponer funciones al window para que puedan ser llamadas desde el HTML
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mapInstance = {
      handleEliminar: (featureId: string, featureName: string) =>
        handleEliminar(featureId, featureName),
    };

    setLayers([
      {
        id: "base",
        title: "Mapa Base",
        visible: true,
        opacity: 1,
        layer: baseLayer,
      },
      {
        id: "uni_uader",
        title: "Ubicación Unidades Académicas UADER",
        visible: true,
        opacity: 1,
        layer: uniUaderLayer,
      },
    ]);

    // Crear overlay para popup
    const popupElement = document.getElementById("popup") as HTMLElement;
    const popupOverlay = new Overlay({
      id: "popup_overlay",
      element: popupElement,
      positioning: "bottom-center",
      stopEvent: true,
      offset: [0, -10], // para que no tape el punto
    });
    map.addOverlay(popupOverlay);

    // 🎯 Interacción de selección
    const select = new Select({
      condition: click, // solo con clic
      // Usamos una función de estilo en lugar de un objeto estático
      style: function (feature) {
        if (feature) {
          const geometryType = feature.getGeometry()?.getType();
          const styles = [];

          // Estilo para Puntos (Point, MultiPoint)
          if (geometryType === "Point" || geometryType === "MultiPoint") {
            styles.push(
              new Style({
                image: new CircleStyle({
                  radius: 7,
                  fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }), // Relleno rojo transparente
                  stroke: new Stroke({ color: "red", width: 2 }), // Borde rojo
                }),
              })
            );
          }
          // Estilo para Líneas (LineString, MultiLineString)
          else if (
            geometryType === "LineString" ||
            geometryType === "MultiLineString"
          ) {
            styles.push(
              new Style({
                stroke: new Stroke({
                  color: "blue", // Color de línea azul
                  width: 5,
                }),
              })
            );
          }
          // Estilo para Polígonos y otras geometrías
          else {
            styles.push(
              new Style({
                stroke: new Stroke({
                  color: "yellow", // Borde amarillo
                  width: 3,
                }),
                fill: new Fill({
                  color: "rgba(255, 255, 0, 0.2)", // Relleno amarillo transparente
                }),
              })
            );
          }
          return styles;
        }
      },
    });
    map.addInteraction(select);

    // 📌 Evento cuando seleccionás una feature
    select.on("select", (e) => {
      const selected = e.selected[0];
      if (selected) {
        const values = selected.getProperties();
        const id = selected.get("id");

        setSelectedRegion(id || null);
        setFeatureValues(values);

        // Zoom a la geometría
        const geometry = selected.getGeometry();
        if (geometry) {
          const extent = geometry.getExtent();
          map.getView().fit(extent, {
            duration: 1000,
            padding: [50, 50, 50, 50],
            maxZoom: 14,
          });

          // Mostrar popup mejorado en el centro de la geometría
          const center = geometry.getClosestPoint(
            fromLonLat([lon || 0, lat || 0])
          );
          popupOverlay.setPosition(center);
          popupElement.innerHTML = createPopupContent(
            values,
            popupElement,
            popupOverlay
          );
          popupElement.style.display = "block";
          popupElement.classList.remove("hidden");
        }
      } else {
        // Deselección
        setSelectedRegion(null);
        setFeatureValues(null);
        closePopup(popupElement, popupOverlay);
      }
    });

    // Evento click en región
    map.on("singleclick", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);

      // 👇 limpiar si no hay feature clickeada
      setSelectedRegion(null);
      setFeatureValues(null);

      if (feature) {
        const values = feature.getProperties();
        console.log("Feature values:", values);

        const id = feature.get("id");
        if (id) {
          setSelectedRegion(id);
        }
        setFeatureValues(values);
      } else {
        setModalOpen(true);
      }
    });

    map.on("pointermove", (evt) => {
      const [lon, lat] = toLonLat(evt.coordinate);
      setCoordinate(lon, lat);
    });

    // Cerrar popup al hacer clic fuera
    map.on("click", (evt) => {
      if (!map.forEachFeatureAtPixel(evt.pixel, (f) => f)) {
        closePopup(popupElement, popupOverlay);
      }
    });

    map.on("moveend", async () => {
      const view = map.getView();
      const [lon, lat] = view.getCenter()!;
      const lonLat = toLonLat([lon, lat]);

      //console.log("Centro del mapa:", lonLat);
      //const puntos = await buscarCercanos(lat, lon);
      //console.log("Puntos cercanos:", puntos);
    });

    return () => {
      // Limpiar referencias del window
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).mapInstance;
      map.setTarget(undefined);
    };
  }, [setMap, setLayers, setSelectedRegion]);

  // 2️⃣ Cargar ubicaciones solo cuando el usuario ya esté disponible
  useEffect(() => {
    if (!user) return;

    const loadUbicaciones = async () => {
      try {
        const vectorLayer = await fetchUbicacionesDelEstudiante(user);

        // Agregar la capa al mapa
        map.addLayer(vectorLayer);

        // Validar si ya existe una layer similar, eliminarla para evitar duplicados
        const existingIndex = layers.findIndex(
          (l) => l.id === "ubicacion_estudiante"
        );
        if (existingIndex !== -1) {
          const existingLayer = layers[existingIndex].layer;
          map.removeLayer(existingLayer);
          layers.splice(existingIndex, 1); // Eliminar del estado
        }

        layers.push({
          id: "ubicacion_estudiante",
          title: "Mi Ubicación",
          visible: true,
          opacity: 1,
          layer: vectorLayer,
        });
      } catch (err) {
        console.error("Error cargando ubicaciones:", err);
      }
    };

    loadUbicaciones();
  }, [user]);

  useEffect(() => {
    if (user) {
      setUser(user); // 👈 guardás el user apenas esté disponible
    }
  }, [user, setUser]);

  return (
    <>
      <div className="w-full h-full border shadow relative">
        <div ref={mapRef} className="w-full h-full" />
        <div
          id="popup"
          className="absolute bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 hidden z-50 min-w-[280px] max-w-[400px] popup-animated"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        />
      </div>

      {/* Estilos CSS integrados */}
      <style jsx global>{`
        .popup-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          overflow: hidden;
          border-radius: 12px;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .popup-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
          max-width: 200px;
          word-break: break-word;
        }

        .popup-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .popup-close:hover {
          background-color: #f3f4f6;
          color: #374151;
        }

        .popup-content {
          max-height: 300px;
          overflow-y: auto;
          padding: 16px 20px 20px 20px;

          /* Scroll elegante */
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .popup-content::-webkit-scrollbar {
          width: 6px;
        }

        .popup-content::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        .popup-content::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }

        .popup-content::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }

        .popup-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          gap: 12px;
        }

        .popup-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .popup-label {
          font-size: 13px;
          font-weight: 500;
          color: #4b5563;
          flex-shrink: 0;
          min-width: 80px;
        }

        .popup-value {
          font-size: 13px;
          color: #1f2937;
          text-align: right;
          word-break: break-word;
          line-height: 1.4;
        }

        /* Animación de entrada */
        .popup-animated {
          transition: all 0.2s ease;
          transform: translateY(-5px);
          opacity: 0;
        }

        .popup-animated[style*="block"] {
          transform: translateY(0);
          opacity: 1;
        }

        /* Botones de acción */
        .popup-actions {
          display: flex;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        .popup-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .popup-btn-edit {
          background-color: #3b82f6;
          color: white;
        }

        .popup-btn-edit:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .popup-btn-delete {
          background-color: #ef4444;
          color: white;
        }

        .popup-btn-delete:hover {
          background-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }

        .popup-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          #popup {
            min-width: 260px !important;
            max-width: 300px !important;
          }

          .popup-header {
            padding: 12px 16px 10px 16px;
          }

          .popup-title {
            font-size: 14px;
            max-width: 180px;
          }

          .popup-content {
            padding: 12px 16px 16px 16px;
            max-height: 200px;
          }

          .popup-actions {
            padding: 12px 16px;
            flex-direction: column;
            gap: 8px;
          }

          .popup-btn {
            padding: 12px;
            font-size: 14px;
          }

          .popup-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .popup-value {
            text-align: left;
          }
        }
      `}</style>
    </>
  );
}
