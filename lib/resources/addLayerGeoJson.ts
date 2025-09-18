import { Vector as VectorLayer } from "ol/layer";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { LayerData } from "@/store/mapStore";
import type { GeoJSON as GeoJSONType } from "geojson";

export const addLayerGeoJson = async (
  geoJson: GeoJSONType,
  layerName: string
) => {
  // Crear capa vectorial
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(geoJson, {
        featureProjection: "EPSG:3857", // reproyección a web mercator
      }),
    }),
    visible: true,
    opacity: 1,
  });

  // Datos de la capa en el store
  const layerData: LayerData = {
    id: layerName,
    title: layerName,
    visible: true,
    opacity: 1,
    layer: vectorLayer,
  };

  return { vectorLayer, layerData };
};
