import {
  Style,
  Stroke,
  Fill,
  Circle as CircleStyle,
  Text,
  Icon,
} from "ol/style";
import { Geometry } from "ol/geom";
import { wrapText } from "../resources/wrapText";
import { useMapStore } from "@/store/mapStore";

export const dynamicStyle = (feature: any) => {
  const geometry: Geometry = feature.getGeometry();
  const type = geometry.getType();

  // Propiedad que quieras mostrar como label
  const label = feature.get("nombre") || feature.get("Name") || "";

  if (type === "Point") {
    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "rgba(100, 149, 237, 0.6)" }),
        stroke: new Stroke({ color: "#333", width: 2 }),
      }),
      text: new Text({
        text: label,
        font: "12px Verdana, Arial",
        fill: new Fill({ color: "#000" }),
        stroke: new Stroke({ color: "#fff", width: 3 }),
        offsetY: -12,
      }),
    });
  }

  if (type === "LineString" || type === "MultiLineString") {
    return new Style({
      stroke: new Stroke({
        color: "rgba(255, 140, 0, 0.9)", // naranja
        width: 3,
      }),
    });
  }

  if (type === "Polygon" || type === "MultiPolygon") {
    return new Style({
      stroke: new Stroke({ color: "#333", width: 2 }),
      fill: new Fill({
        color: "rgba(50, 205, 50, 0.4)", // verde semi
      }),
    });
  }

  // fallback (por si hay geometrías no contempladas)
  return new Style({
    stroke: new Stroke({ color: "#000", width: 1 }),
    fill: new Fill({ color: "rgba(200, 200, 200, 0.3)" }),
  });
};

export const styleUniFcyt = (feature: any) => {
  const map = useMapStore.getState().map; // obtener el mapa desde el store

  const zoom = map.getView().getZoom() ?? 0;

  const geometry: Geometry = feature.getGeometry();
  const type = geometry.getType();

  // Propiedad que quieras mostrar como label
  const label = zoom >= 11 ? feature.get("sede_nomb") : feature.get("sede");

  if (type === "Point") {
    const style = new Style({
      image: new Icon({
        src: "/pin-colegio.png", // ruta a la imagen (puede ser PNG, JPG o SVG)
        scale: 0.7, // para ajustar el tamaño
        anchor: [0.5, 1], // punto de anclaje (centro abajo)
      }),
      text: new Text({
        text: wrapText(label, 35).join("\n"),
        font: "12px Verdana, Arial",
        fill: new Fill({ color: "#000" }),
        stroke: new Stroke({ color: "#fff", width: 3 }),
        offsetY: -32,
      }),
    });

    return style;
  }

  return new Style({
    stroke: new Stroke({ color: "#000", width: 1 }),
    fill: new Fill({ color: "rgba(200, 200, 200, 0.3)" }),
  });
};
