export const getWFSCapabilities = async (url?: string) => {
  const recurso = url || "/geoserver/ows";
  const res = await fetch(`${recurso}?service=WFS&request=GetCapabilities`);
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

export const getWFSLayer = async (layer: string) => {
  const url = `/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json&srsName=EPSG:4326`;

  const res = await fetch(url);
  const geojson = await res.json();

  return geojson;
};
