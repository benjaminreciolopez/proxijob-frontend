// utils/geo.ts

export interface Coordenada {
  latitud: number;
  longitud: number;
}

export interface ZonaTrabajo extends Coordenada {
  radio_km: number;
}

export interface Solicitud extends Coordenada {
  id: string;
  [key: string]: any;
}

export function calcularDistanciaKm(a: Coordenada, b: Coordenada): number {
  const R = 6371; // radio de la Tierra en km
  const dLat = (b.latitud - a.latitud) * (Math.PI / 180);
  const dLon = (b.longitud - a.longitud) * (Math.PI / 180);
  const lat1 = a.latitud * (Math.PI / 180);
  const lat2 = b.latitud * (Math.PI / 180);

  const aCalc =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
  return R * c;
}

export function filtrarSolicitudesPorZonas(
  solicitudes: Solicitud[],
  zonas: ZonaTrabajo[]
): Solicitud[] {
  return solicitudes.filter((solicitud) =>
    zonas.some((zona) => {
      const distancia = calcularDistanciaKm(solicitud, zona);
      return distancia <= zona.radio_km;
    })
  );
}
