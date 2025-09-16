export const getCapabilities = async (tipo: string, url?: string) => {
  const recurso = url;
  const res = await fetch(`${recurso}?service=${tipo}&request=GetCapabilities`);
  const text = await res.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");

  const featureTypes = Array.from(xml.getElementsByTagName("FeatureType")).map(
    (ft) => {
      const name = ft.getElementsByTagName("Name")[0].textContent;
      const title = ft.getElementsByTagName("Title")[0].textContent;
      return { name, title };
    }
  );

  return featureTypes;
};

export const getLayerGeoservicio = async (
  url: string,
  layer: string,
  tipo: string
) => {
  const urlConcat = `${url}?service=${tipo}&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json&srsName=EPSG:4326`;

  const res = await fetch(`/api/proxy?url=${encodeURIComponent(urlConcat)}`);
  const geojson = await res.json();

  return geojson;
};
