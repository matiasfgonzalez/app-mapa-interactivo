"use client";

import { useEffect, useRef, useMemo } from "react";
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
  createNearbyStudentsLayer,
} from "@/lib/const/layers";
import Layer from "ol/layer/Layer";
import Overlay from "ol/Overlay";
import { toast } from "sonner";
import { FeatureValues } from "@/lib/types/featureValues";
import { excludeKeys } from "@/lib/types/excludeKeys";
import { createClient } from "@/lib/supabase/client";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  
  // Guardamos las referencias reales de las layers creadas por OL
  const layersRef = useRef<Record<string, Layer>>({
    base: baseLayer,
    uni_uader: uniUaderLayer,
  });
  const mapInstanceRef = useRef<Map | null>(null);

  const layersConfig = useMapStore((s) => s.layers);
  const studentData = useMapStore((s) => s.studentData);
  const nearbyStudentsData = useMapStore((s) => s.nearbyStudentsData);

  const setSelectedRegion = useMapStore((s) => s.setSelectedRegion);
  const setFeatureValues = useMapStore((s) => s.setFeatureValues);
  const setCoordinate = useMapStore((s) => s.setCoordinate);
  
  // user comes from hook or state? we can use mapStore state user
  const user = useMapStore((s) => s.user);

  // Función para cerrar popup
  const closePopup = (popupElement: HTMLElement, popupOverlay: Overlay) => {
    popupElement.style.display = "none";
    popupElement.classList.remove("popup-show");
    popupOverlay.setPosition(undefined);
  };

  // Función para manejar la eliminación
  const handleEliminar = async (featureId: string, featureName: string) => {
    try {
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

      if (user) {
         // Re-fetch y actualizar Zustand
         useMapStore.getState().updateStudentLocationLayer(user);
      }

      const map = mapInstanceRef.current;
      if (map) {
        const popupElement = popupRef.current;
        const popupOverlay = map.getOverlayById("popup_overlay") as Overlay;
        if (popupElement && popupOverlay) closePopup(popupElement, popupOverlay);
      }

      toast.success(`Ubicación eliminada correctamente`);
      return result;
    } catch (err) {
      console.error("Error eliminando ubicación:", err);
      throw err;
    }
  };

  // Función para crear contenido del popup
  const createPopupContent = (
    values: FeatureValues,
    popupElement: HTMLElement,
    popupOverlay: Overlay,
  ) => {
    const featureId = values.id || values.gid || values.objectid || "unknown";
    const featureName = (values.nombre as string) || "Región Seleccionada";

    const featureUserId = values.user_id || values.userid || values.usuario_id;
    const isOwnedByCurrentUser = user && featureUserId && featureUserId === user.id;

    return `
      <div class="popup-container">
        <!-- Header del popup -->
        <div class="popup-header">
          <h3 class="popup-title">${featureName}</h3>
          <button class="popup-close" onclick="(function() {
            const popup = document.getElementById('popup');
            if (popup) {
              popup.classList.remove('popup-show');
              setTimeout(() => popup.style.display='none', 300);
            }
          })()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
                }</span>
                <span class="popup-value">${val || "N/A"}</span>
              </div>
            `,
            )
            .join("")}
        </div>
        
        <!-- Botones de acción - solo mostrar si es del usuario -->
        ${
          isOwnedByCurrentUser
            ? `
        <div class="popup-actions">
          <button 
            class="popup-btn popup-btn-delete" 
            onclick="window.mapInstance?.handleEliminar('${featureId}', '${featureName.replace(
              /'/g,
              "\\'",
            )}')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2V6"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Eliminar</span>
          </button>
        </div>
        `
            : `
        <div class="popup-actions">
          <button 
            class="popup-btn popup-btn-close" 
            onclick="(function() {
              const popup = document.getElementById('popup');
              if (popup) {
                popup.classList.remove('popup-show');
                setTimeout(() => popup.style.display='none', 300);
              }
            })()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Cerrar</span>
          </button>
        </div>
        `
        }
      </div>
    `;
  };

  // 1. Inicializar el mapa
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return; // Evitar inicializar 2 veces

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, uniUaderLayer],
      view: new View({
        center: fromLonLat([-59, -32]),
        zoom: 7,
      }),
    });

    mapInstanceRef.current = map;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mapInstance = map;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mapActions = {
      handleEliminar: (featureId: string, featureName: string) =>
        handleEliminar(featureId, featureName),
      registerLayer: (id: string, layer: Layer) => {
        layersRef.current[id] = layer;
      }
    };

    // Crear overlay para popup
    const popupElement = popupRef.current;
    if (!popupElement) return; // Validación de nulidad crucial

    const popupOverlay = new Overlay({
      id: "popup_overlay",
      element: popupElement,
      autoPan: { animation: { duration: 250 } },
      positioning: "center-center",
      stopEvent: true,
      offset: [20, -233],
    });
    map.addOverlay(popupOverlay);

    // 🎯 Interacción de selección
    const select = new Select({
      condition: click,
      style: function (feature) {
        if (feature) {
          const geometryType = feature.getGeometry()?.getType();
          const styles = [];

          if (geometryType === "Point" || geometryType === "MultiPoint") {
            styles.push(
              new Style({
                image: new CircleStyle({
                  radius: 7,
                  fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }),
                  stroke: new Stroke({ color: "red", width: 2 }),
                }),
              }),
            );
          } else if (
            geometryType === "LineString" ||
            geometryType === "MultiLineString"
          ) {
            styles.push(
              new Style({ stroke: new Stroke({ color: "blue", width: 5 }) }),
            );
          } else {
            styles.push(
              new Style({
                stroke: new Stroke({ color: "yellow", width: 3 }),
                fill: new Fill({ color: "rgba(255, 255, 0, 0.2)" }),
              }),
            );
          }
          return styles;
        }
      },
    });
    map.addInteraction(select);

    select.on("select", (e) => {
      const selected = e.selected[0];
      if (selected) {
        const values = selected.getProperties();
        const id = selected.get("id");

        setSelectedRegion(id || null);
        setFeatureValues(values);

        const geometry = selected.getGeometry();
        if (geometry) {
          const extent = geometry.getExtent();
          const centerX = (extent[0] + extent[2]) / 2;
          const centerY = (extent[1] + extent[3]) / 2;
          const center = [centerX, centerY];

          const geometryType = geometry.getType();
          let maxZoom = 12;
          let padding = [100, 400, 100, 100];

          if (geometryType === "Point" || geometryType === "MultiPoint") {
            maxZoom = 14;
            padding = [80, 380, 80, 80];
          } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
            maxZoom = 13;
            padding = [90, 400, 90, 90];
          } else {
            maxZoom = 11;
            padding = [100, 420, 100, 100];
          }

          map.getView().fit(extent, {
            duration: 800,
            padding: padding,
            maxZoom: maxZoom,
            easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
          });

          setTimeout(() => {
            popupOverlay.setPosition(center);
            popupElement.innerHTML = createPopupContent(values, popupElement, popupOverlay);
            popupElement.style.display = "block";

            setTimeout(() => {
              if (popupElement) popupElement.classList.add("popup-show");
            }, 10);
          }, 400);
        }
      } else {
        setSelectedRegion(null);
        setFeatureValues(null);
        if (popupElement) {
          popupElement.classList.remove("popup-show");
          setTimeout(() => closePopup(popupElement, popupOverlay), 200);
        }
      }
    });

    map.on("click", (e) => {
      // si checkUbicacion es true, le pasamos las coordenadas
      const state = useMapStore.getState();
      if (state.checkUbicacion) {
        const [lonClick, latClick] = toLonLat(e.coordinate);
        setCoordinate(lonClick, latClick);
        state.setModalOpen(true);
      }
    });
    
    // Al desmontar, destruimos el mapa
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Sincronizar Student Data (Mi Ubicación)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !user) return; // user is required here for permissions if we want it, but fetch happens in store

    if (studentData) {
      // Recreamos la capa
      fetchUbicacionesDelEstudiante(user).then((vectorLayer) => {
        if (!vectorLayer) return;

        // Remover capa existente de OL
        const oldLayer = layersRef.current["ubicacion_estudiante"];
        if (oldLayer) map.removeLayer(oldLayer);

        layersRef.current["ubicacion_estudiante"] = vectorLayer;
        
        // Match visibility/opacity from config if exists
        const config = useMapStore.getState().layers.find(l => l.id === "ubicacion_estudiante");
        if (config) {
          vectorLayer.setVisible(config.visible);
          vectorLayer.setOpacity(config.opacity);
        }
        
        map.addLayer(vectorLayer);
      });
    }
  }, [studentData, user]);

  // 3. Sincronizar Nearby Students (Estudiantes Cercanos)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (nearbyStudentsData && nearbyStudentsData.length > 0) {
      createNearbyStudentsLayer(nearbyStudentsData).then((vectorLayer) => {
        if (!vectorLayer) return;

        const oldLayer = layersRef.current["estudiantes_cercanos"];
        if (oldLayer) map.removeLayer(oldLayer);

        layersRef.current["estudiantes_cercanos"] = vectorLayer;
        
        const config = useMapStore.getState().layers.find(l => l.id === "estudiantes_cercanos");
        if (config) {
          vectorLayer.setVisible(config.visible);
          vectorLayer.setOpacity(config.opacity);
        }
        
        map.addLayer(vectorLayer);
      });
    } else {
       // Eliminamos si no hay data
       const oldLayer = layersRef.current["estudiantes_cercanos"];
       if (oldLayer) {
          map.removeLayer(oldLayer);
          delete layersRef.current["estudiantes_cercanos"];
       }
    }
  }, [nearbyStudentsData]);

  // 4. Sincronizar Visibility and Opacity and Z-Index based on LayerConfig changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Actualizamos zIndex en el orden del array
    layersConfig.forEach((conf, index) => {
      const realLayer = layersRef.current[conf.id];
      if (realLayer) {
        realLayer.setVisible(conf.visible);
        realLayer.setOpacity(conf.opacity);
        // reverse index because CSS z-index (first in array is lower)
        realLayer.setZIndex(layersConfig.length - index);
      }
    });
  }, [layersConfig]);

  return (
    <>
      <div id="map" ref={mapRef} className="w-full h-full " />
      <div
        id="popup"
        ref={popupRef}
        className="ol-popup absolute"
        style={{ display: "none" }}
      ></div>
    </>
  );
}
