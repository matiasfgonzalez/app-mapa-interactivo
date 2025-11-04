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
      if (!map) {
        toast.error("El mapa no está inicializado");
        return;
      }

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
      if (!user) {
        toast.error("Usuario no encontrado");
        return;
      }

      const vectorLayer = await fetchUbicacionesDelEstudiante(user);
      if (!vectorLayer) {
        toast.error("No se pudo cargar la capa de ubicaciones");
        return;
      }

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
          <button class="popup-close" onclick="(function() {
            const popup = document.getElementById('popup');
            popup.classList.remove('popup-show');
            setTimeout(() => popup.style.display='none', 200);
          })()">
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
            <span>Eliminar</span>
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
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      positioning: "center-center", // Popup centrado en el punto
      stopEvent: true,
      offset: [20, -233], // Desplazar ~160px (mitad del ancho del popup) para que el punto quede en el borde izquierdo
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

        // Obtener la geometría y calcular su centro
        const geometry = selected.getGeometry();
        if (geometry) {
          const extent = geometry.getExtent();

          // Calcular el centro de la geometría
          const centerX = (extent[0] + extent[2]) / 2;
          const centerY = (extent[1] + extent[3]) / 2;
          const center = [centerX, centerY];

          // Determinar el tipo de geometría para ajustar el zoom
          const geometryType = geometry.getType();
          let maxZoom = 12;
          let padding = [100, 400, 100, 100]; // [top, right, bottom, left] - más espacio a la derecha para el popup

          // Ajustar zoom según el tipo de geometría
          if (geometryType === "Point" || geometryType === "MultiPoint") {
            maxZoom = 14;
            padding = [80, 380, 80, 80];
          } else if (
            geometryType === "LineString" ||
            geometryType === "MultiLineString"
          ) {
            maxZoom = 13;
            padding = [90, 400, 90, 90];
          } else {
            // Polígonos y otras geometrías
            maxZoom = 11;
            padding = [100, 420, 100, 100];
          }

          // Hacer zoom suave con animación mejorada
          map.getView().fit(extent, {
            duration: 800,
            padding: padding,
            maxZoom: maxZoom,
            easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t), // easeInOutQuad
          });

          // Pequeño delay antes de mostrar el popup para que la animación se complete
          setTimeout(() => {
            // Posicionar el popup en el centro de la geometría
            popupOverlay.setPosition(center);
            popupElement.innerHTML = createPopupContent(
              values,
              popupElement,
              popupOverlay
            );
            popupElement.style.display = "block";
            popupElement.classList.remove("hidden");

            // Trigger de animación
            setTimeout(() => {
              popupElement.classList.add("popup-show");
            }, 10);
          }, 400);
        }
      } else {
        // Deselección
        setSelectedRegion(null);
        setFeatureValues(null);
        popupElement.classList.remove("popup-show");
        setTimeout(() => {
          closePopup(popupElement, popupOverlay);
        }, 200);
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
        popupElement.classList.remove("popup-show");
        setTimeout(() => {
          closePopup(popupElement, popupOverlay);
        }, 200);
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
    if (!user || !map) return;

    const loadUbicaciones = async () => {
      try {
        const vectorLayer = await fetchUbicacionesDelEstudiante(user);
        if (!vectorLayer) {
          console.error("No se pudo cargar la capa de ubicaciones");
          return;
        }

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
  }, [user, map]);

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
          className="absolute bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 hidden z-50 min-w-[300px] max-w-[420px]"
          style={{
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
          }}
        />
      </div>

      {/* Estilos CSS integrados */}
      <style jsx global>{`
        .popup-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px 14px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .popup-title {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.4;
          max-width: 220px;
          word-break: break-word;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .popup-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          backdrop-filter: blur(10px);
        }

        .popup-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .popup-content {
          max-height: 320px;
          overflow-y: auto;
          padding: 20px 24px 24px 24px;
          background: #ffffff;

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
          margin: 8px 0;
        }

        .popup-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .popup-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .popup-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 6px;
          gap: 16px;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .popup-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .popup-item:last-child {
          margin-bottom: 0;
        }

        .popup-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          flex-shrink: 0;
          min-width: 90px;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .popup-value {
          font-size: 14px;
          color: #1e293b;
          text-align: right;
          word-break: break-word;
          line-height: 1.5;
          font-weight: 500;
        }

        /* Animación de entrada mejorada */
        #popup {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateX(-20px) scale(0.9);
          opacity: 0;
          pointer-events: none;
        }

        #popup.popup-show {
          transform: translateX(0) scale(1);
          opacity: 1;
          pointer-events: auto;
        }

        /* Flecha del popup - apunta hacia la izquierda */
        #popup::before {
          content: "";
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
          border-right: 12px solid #667eea;
          filter: drop-shadow(-2px 0 4px rgba(0, 0, 0, 0.1));
        }

        #popup::after {
          content: "";
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-right: 10px solid #ffffff;
        }

        /* Botones de acción mejorados */
        .popup-actions {
          display: flex;
          gap: 10px;
          padding: 18px 24px;
          border-top: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #f9fafb 0%, #f1f5f9 100%);
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }

        .popup-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .popup-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .popup-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .popup-btn-edit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .popup-btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        .popup-btn-edit:active {
          transform: translateY(0);
        }

        .popup-btn-delete {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        }

        .popup-btn-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(245, 87, 108, 0.5);
        }

        .popup-btn-delete:active {
          transform: translateY(0);
        }

        .popup-btn svg {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 1;
        }

        .popup-btn span {
          position: relative;
          z-index: 1;
        }

        /* Efecto de brillo en el header */
        .popup-header::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: rotate(45deg);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }

        /* Responsive mejorado */
        @media (max-width: 480px) {
          #popup {
            min-width: 280px !important;
            max-width: 320px !important;
          }

          .popup-header {
            padding: 14px 18px 12px 18px;
          }

          .popup-title {
            font-size: 15px;
            max-width: 200px;
          }

          .popup-content {
            padding: 16px 18px 18px 18px;
            max-height: 260px;
          }

          .popup-actions {
            padding: 14px 18px;
            flex-direction: column;
            gap: 10px;
          }

          .popup-btn {
            padding: 14px;
            font-size: 14px;
          }

          .popup-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 10px;
          }

          .popup-value {
            text-align: left;
          }

          .popup-label {
            min-width: auto;
          }
        }

        /* Animación de entrada para items */
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .popup-show .popup-item {
          animation: slideInRight 0.3s ease forwards;
        }

        .popup-show .popup-item:nth-child(1) {
          animation-delay: 0.05s;
        }
        .popup-show .popup-item:nth-child(2) {
          animation-delay: 0.1s;
        }
        .popup-show .popup-item:nth-child(3) {
          animation-delay: 0.15s;
        }
        .popup-show .popup-item:nth-child(4) {
          animation-delay: 0.2s;
        }
        .popup-show .popup-item:nth-child(5) {
          animation-delay: 0.25s;
        }
      `}</style>
    </>
  );
}
