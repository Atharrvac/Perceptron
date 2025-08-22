interface LatLng {
  lat: number;
  lng: number;
}

interface SceneBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  width: number;
  height: number;
}

export function latLngToCoords(
  lat: number,
  lng: number,
  bounds: SceneBounds
): [number, number, number] {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * bounds.width - bounds.width / 2;
  const z = ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * bounds.height - bounds.height / 2;
  return [x, 0, z];
}

export function coordsToLatLng(
  x: number,
  z: number,
  bounds: SceneBounds
): LatLng {
  const lng = ((x + bounds.width / 2) / bounds.width) * (bounds.maxLng - bounds.minLng) + bounds.minLng;
  const lat = ((z + bounds.height / 2) / bounds.height) * (bounds.maxLat - bounds.minLat) + bounds.minLat;
  return { lat, lng };
} 