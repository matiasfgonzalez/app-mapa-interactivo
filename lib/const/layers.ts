import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { createCircleIcon, dynamicStyle, styleUniFcyt } from "./styles";
import KML from "ol/format/KML";
import JSZip from "jszip";
import { User } from "@supabase/supabase-js";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";
import { EstudianteType } from "../types/estudianteType";
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
  style: styleUniFcyt,
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

// Llamar a la api y obtener los datos y a partir de las coordenadas crear features
export const fetchUbicacionesDelEstudiante = async (user: User) => {
  const response = await fetch(`/api/ubicaciones?user_id=${user.id}`);
  const result = await response.json();
  if (result.success) {
    const featuresData = result.data;

    const canvas = await createCircleIcon(
      user.user_metadata?.avatar_url || "/default-avatar.png",
      50
    );

    // Crear features a partir de los datos
    const features = featuresData.map((u: EstudianteType) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([u.lon, u.lat])),
        ...u,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            img: canvas,
            scale: 0.7,
            anchor: [0.5, 1],
          }),
        })
      );

      return feature;
    });

    // Crear capa vectorial
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
    });

    return vectorLayer;
  } else {
    console.error("Error al cargar ubicaciones:", result.error);
    return null;
  }
};

export const ubicacionDelEstudianteLayer = new VectorLayer({
  source: new VectorSource(),
  style: dynamicStyle,
});
