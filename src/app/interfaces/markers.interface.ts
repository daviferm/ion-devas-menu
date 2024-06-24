

export interface LayerBarrio {
  id: string;
  options: {
    fillColor: string,
    strokeWeight: number,
    geodesic: boolean,
    strokeColor?: string
  }
  coords: {lat: number, lng: number}[];
}

export interface Parquimetro {
  id?: number;
  alias: string;
  barrio: string;
  direccion: string;
  date?: number;
  desc?: string;
  empresa: string;
  estado: string;
  fabricante: string;
  hecho?: boolean;
  idx: string;
  urlImg?: string;
  nameImg?: string;
  latitud: number;
  longitud: number;
  info?: boolean;
  opacidad?: number;
  options?: any,
  tarifa: string;
}

export interface ArrayPark {
  parkimetros: Parquimetro[];
}

export interface BarrioInterface {
  localId: number;
  barrio: string;
  titulo: string;
  uid?: string;
  hecho: boolean;
  date?: number;
  items: Parquimetro[];
}

export interface GeolocationPosition {
  coords: {
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: any;
    latitude: number;
    longitude: number;
    speed: any;
  },
  timestamp: number
}


export interface ListaInteface {
  localId: number;
  titulo: string;
  items: Parquimetro[];
}
export interface IncidenciaInteface {
  localId: number;
  titulo: string;
  item: Parquimetro;
}

export interface AltaRotacion {
  barrio: string,
  items: Parquimetro[]
}


