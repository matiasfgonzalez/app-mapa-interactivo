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
    popupElement.classList.remove("popup-show");
    popupOverlay.setPosition(undefined);
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
        (l) => l.id === "ubicacion_estudiante",
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
    popupOverlay: Overlay,
  ) => {
    const featureId = values.id || values.gid || values.objectid || "unknown";
    const featureName = (values.nombre as string) || "Región Seleccionada";

    // Verificar si es una ubicación del usuario actual
    const currentUser = useMapStore.getState().user;
    const featureUserId = values.user_id || values.userid || values.usuario_id;
    const isOwnedByCurrentUser =
      currentUser && featureUserId && featureUserId === currentUser.id;

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
              popup.classList.remove('popup-show');
              setTimeout(() => popup.style.display='none', 200);
            })()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
              }),
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
              }),
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
              }),
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
              popupOverlay,
            );
            popupElement.style.display = "block";

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
        // Solo abrir modal si checkUbicacion está activo
        const { checkUbicacion } = useMapStore.getState();
        if (checkUbicacion) {
          setModalOpen(true);
        }
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
          (l) => l.id === "ubicacion_estudiante",
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
        <div id="popup" />
      </div>
    </>
  );
}
