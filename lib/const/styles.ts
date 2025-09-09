import { Style, Stroke, Fill, Circle as CircleStyle, Text } from "ol/style";
import { Geometry } from "ol/geom";

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
