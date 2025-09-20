export interface LocalidadType {
  categoria: string;
  centroide: Centroide;
  departamento: Departamento;
  id: string;
  localidad_censal: LocalidadCensal;
  municipio: Municipio;
  nombre: string;
  provincia: Provincia;
}

export interface Centroide {
  lat: number;
  lon: number;
}

export interface Departamento {
  id: string;
  nombre: string;
}

export interface LocalidadCensal {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  nombre: string;
}

export interface Provincia {
  id: string;
  nombre: string;
}
