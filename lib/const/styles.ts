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
import { FeatureLike } from "ol/Feature";

export const dynamicStyle = (feature: FeatureLike): Style => {
  const geometry = feature.getGeometry() as Geometry | undefined;
  if (!geometry) {
    return new Style({
      stroke: new Stroke({ color: "#000", width: 1 }),
      fill: new Fill({ color: "rgba(200, 200, 200, 0.3)" }),
    });
  }

  const type = geometry.getType();
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
      stroke: new Stroke({ color: "rgba(255, 140, 0, 0.9)", width: 3 }),
    });
  }

  if (type === "Polygon" || type === "MultiPolygon") {
    return new Style({
      stroke: new Stroke({ color: "#333", width: 2 }),
      fill: new Fill({ color: "rgba(50, 205, 50, 0.4)" }),
    });
  }

  // fallback
  return new Style({
    stroke: new Stroke({ color: "#000", width: 1 }),
    fill: new Fill({ color: "rgba(200, 200, 200, 0.3)" }),
  });
};

export const styleUniFcyt = (feature: FeatureLike): Style => {
  const geometry = feature.getGeometry() as Geometry | undefined;
  if (!geometry) {
    return new Style({
      stroke: new Stroke({ color: "#000", width: 1 }),
      fill: new Fill({ color: "rgba(200,200,200,0.3)" }),
    });
  }

  const type = geometry.getType();
  const map = useMapStore.getState().map;
  const zoom = map?.getView().getZoom() ?? 0;

  const label: string =
    zoom >= 11
      ? (feature.get("sede_nomb") as string)
      : (feature.get("sede") as string);

  if (type === "Point") {
    return new Style({
      image: new Icon({
        src: "/pin-colegio.png",
        scale: 0.7,
        anchor: [0.5, 1],
      }),
      text: new Text({
        text: wrapText(label, 35).join("\n"),
        font: "12px Verdana, Arial",
        fill: new Fill({ color: "#000" }),
        stroke: new Stroke({ color: "#fff", width: 3 }),
        offsetY: -32,
      }),
    });
  }

  return new Style({
    stroke: new Stroke({ color: "#000", width: 1 }),
    fill: new Fill({ color: "rgba(200,200,200,0.3)" }),
  });
};

export const createCircleIcon = async (
  imgUrl: string,
  size = 50,
  borderColor = "#4CAF50"
) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = new Image();
  img.src = imgUrl;
  return new Promise<HTMLCanvasElement>((resolve) => {
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Dibujar borde de color
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = borderColor;
      ctx.fill();

      // Clip para la imagen
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 3, 3, size - 6, size - 6);
      ctx.restore();
      resolve(canvas);
    };
  });
};
