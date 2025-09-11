import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { dynamicStyle } from "./styles";
import KML from "ol/format/KML";
import JSZip from "jszip";
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from "ol/style";
// Capas para insertar en el mapa

// Capa base OSM
export const baseLayer = new TileLayer({
  source: new OSM(),
});

// Capa del catalogo - Ubicación unidades Académicas UADER
const vectorSourceUniUader = new VectorSource({
  url: "/uni_uader.geojson",
  format: new GeoJSON(),
});

export const uniUaderLayer = new VectorLayer({
  source: vectorSourceUniUader,
  style: dynamicStyle,
});

//  Capa areas de actividad agropecuaria KML
export const areasDeActividadAgropecuariaLayer = new VectorLayer({
  source: new VectorSource({
    url: "/areas_de_actividad_agropecuaria_AL270.kml", // ruta al archivo en /public
    format: new KML(),
  }),
  visible: true,
  opacity: 0.8,
});

//  Capa areas de argentina_division_politica KML
async function loadKmzLayer(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  const zip = await JSZip.loadAsync(blob);
  // Buscar el primer archivo .kml dentro del zip
  const kmlFile = Object.keys(zip.files).find((f) => f.endsWith(".kml"));
  if (!kmlFile) throw new Error("No se encontró un .kml en el KMZ");

  const kmlText = await zip.files[kmlFile].async("text");

  return new VectorSource({
    features: new KML().readFeatures(kmlText, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    }),
  });
}

// Capa del catalogo - argentina_division_politica
const argentina_division_politica = new VectorSource({
  url: "/catalogo/argentina_division_politica.geojson",
  format: new GeoJSON(),
});

export const argentina_division_politicaLayer = new VectorLayer({
  source: argentina_division_politica,
  style: dynamicStyle,
});

// Capa a partir de un link wfs
// Fuente WFS
const wfsSource = new VectorSource({
  format: new GeoJSON(),
  url:
    "/geoserver/ows?service=WFS&" +
    "version=1.0.0&request=GetFeature&" +
    "typename=geonode:30_loc_f&" +
    "outputFormat=application/json&" +
    "srsName=EPSG:4326",
});

export const wfsLayer = new VectorLayer({
  source: wfsSource,
});
