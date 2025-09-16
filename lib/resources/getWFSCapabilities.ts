export const getWFSCapabilities = async (url?: string) => {
  url = url + "?service=WFS&request=GetCapabilities";
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
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
  const url = `/geoserver/idera/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json&srsName=EPSG:4326`;

  const res = await fetch(url);
  const geojson = await res.json();

  return geojson;
};

export const getWFSIDECOR = async (url?: string) => {
  url = url + "?service=WFS&request=GetCapabilities";
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
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

export const getWFSIDECORLayer = async (layer: string) => {
  const url = `https://idecor-ws.mapascordoba.gob.ar/geoserver/idecor/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json&srsName=EPSG:4326`;

  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  const geojson = await res.json();

  return geojson;
};
