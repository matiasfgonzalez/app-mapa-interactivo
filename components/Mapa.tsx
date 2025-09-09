"use client";

import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import KML from "ol/format/KML";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import { useMapStore } from "@/store/mapStore";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import CircleStyle from "ol/style/Circle";

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const setMap = useMapStore((s) => s.setMap);
  const setLayers = useMapStore((s) => s.setLayers);
  const setSelectedRegion = useMapStore((s) => s.setSelectedRegion);
  const setFeatureValues = useMapStore((s) => s.setFeatureValues);

  useEffect(() => {
    if (!mapRef.current) return;

    // Capa base OSM
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Cargar GeoJSON de secciones
    const vectorSource = new VectorSource({
      url: "/Provinciasproductorasdearroz_3.geojson",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({ color: "rgba(100, 149, 237, 0.4)" }),
        stroke: new Stroke({ color: "#333", width: 1 }),
      }),
    });

    // Crear capa desde archivo KML
    const kmlLayer = new VectorLayer({
      source: new VectorSource({
        url: "/area_protegida.kml", // ruta al archivo en /public
        format: new KML(),
      }),
      visible: true,
      opacity: 0.8,
    });

    const areasDeActividadAgropecuariaLayer = new VectorLayer({
      source: new VectorSource({
        url: "/areas_de_actividad_agropecuaria_AL270.kml", // ruta al archivo en /public
        format: new KML(),
      }),
      visible: true,
      opacity: 0.8,
    });

    // Crear mapa
    const map = new Map({
      target: mapRef.current,
      layers: [
        baseLayer,
        vectorLayer,
        kmlLayer,
        areasDeActividadAgropecuariaLayer,
      ],
      view: new View({
        center: fromLonLat([-63.5, -35]),
        zoom: 6,
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
        id: "regiones",
        title: "Regiones",
        visible: true,
        opacity: 0.8,
        layer: vectorLayer,
      },
      {
        id: "area_protegida",
        title: "Área Protegida (KML)",
        visible: true,
        opacity: 0.8,
        layer: kmlLayer,
      },
      {
        id: "areas_de_actividad_agropecuaria",
        title: "Área de actividades agro (KML)",
        visible: true,
        opacity: 0.8,
        layer: areasDeActividadAgropecuariaLayer,
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
