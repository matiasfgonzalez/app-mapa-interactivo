"use client";

import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Style, Fill, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import { useMapStore } from "@/store/mapStore";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import CircleStyle from "ol/style/Circle";
import {
  areasDeActividadAgropecuariaLayer,
  argentina_division_politicaLayer,
  baseLayer,
  uniUaderLayer,
} from "@/lib/const/layers";

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const setMap = useMapStore((s) => s.setMap);
  const setLayers = useMapStore((s) => s.setLayers);
  const setSelectedRegion = useMapStore((s) => s.setSelectedRegion);
  const setFeatureValues = useMapStore((s) => s.setFeatureValues);

  useEffect(() => {
    if (!mapRef.current) return;

    // Crear mapa
    const map = new Map({
      target: mapRef.current,
      layers: [
        baseLayer,
        uniUaderLayer,
        areasDeActividadAgropecuariaLayer,
        argentina_division_politicaLayer,
      ],
      view: new View({
        center: fromLonLat([-59, -32]),
        zoom: 7,
      }),
    });

    // Guardar referencia global del mapa y capas en Zustand
    setMap(map);
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
      {
        id: "areas_de_actividad_agropecuaria",
        title: "Área de actividades agro (KML)",
        visible: true,
        opacity: 0.8,
        layer: areasDeActividadAgropecuariaLayer,
      },
      {
        id: "argentina_division_politicaLayer",
        title: "Division politica Argentina",
        visible: true,
        opacity: 0.8,
        layer: argentina_division_politicaLayer,
      },
    ]);

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
        }
      } else {
        // Deselección
        setSelectedRegion(null);
        setFeatureValues(null);
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
      }
    });

    return () => map.setTarget(undefined);
  }, [setMap, setLayers, setSelectedRegion]);

  return <div ref={mapRef} className="w-full h-full border shadow" />;
}
