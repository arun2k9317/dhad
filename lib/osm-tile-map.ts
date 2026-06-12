const TILE_SIZE = 256;

export function latLngToTile(lat: number, lng: number, zoom: number) {
  const scale = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * scale);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      scale
  );
  return { x, y };
}

export function latLngToWorldPixel(lat: number, lng: number, zoom: number) {
  const scale = 2 ** zoom;
  const x = ((lng + 180) / 360) * scale * TILE_SIZE;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    scale *
    TILE_SIZE;
  return { x, y };
}

/** Zoom level so the discovery circle fits the map preview width. */
export function zoomForRadiusKm(
  radiusKm: number,
  lat: number,
  mapWidthPx: number
): number {
  const diameterM = radiusKm * 2_000;
  for (let z = 18; z >= 3; z -= 1) {
    const metersPerPixel =
      (156_543.03 * Math.cos((lat * Math.PI) / 180)) / 2 ** z;
    const visibleWidthM = metersPerPixel * mapWidthPx;
    if (visibleWidthM >= diameterM) return z;
  }
  return 3;
}

export function radiusCircleDiameterPx(
  radiusMeters: number,
  lat: number,
  zoom: number
): number {
  const metersPerPixel =
    (156_543.03 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
  return Math.max(20, (2 * radiusMeters) / metersPerPixel);
}

export type MapTile = {
  x: number;
  y: number;
  key: string;
};

export function tilesAroundPoint(
  lat: number,
  lng: number,
  zoom: number,
  ring = 1
): { tiles: MapTile[]; gridSize: number; centerTile: { x: number; y: number } } {
  const centerTile = latLngToTile(lat, lng, zoom);
  const tiles: MapTile[] = [];
  for (let dy = -ring; dy <= ring; dy += 1) {
    for (let dx = -ring; dx <= ring; dx += 1) {
      const x = centerTile.x + dx;
      const y = centerTile.y + dy;
      tiles.push({ x, y, key: `${zoom}-${x}-${y}` });
    }
  }
  return {
    tiles,
    gridSize: ring * 2 + 1,
    centerTile,
  };
}

export function tileGridOffset(
  lat: number,
  lng: number,
  zoom: number,
  ring: number,
  viewportWidth: number,
  viewportHeight: number
) {
  const world = latLngToWorldPixel(lat, lng, zoom);
  const { centerTile } = tilesAroundPoint(lat, lng, zoom, ring);
  const topLeftX = (centerTile.x - ring) * TILE_SIZE;
  const topLeftY = (centerTile.y - ring) * TILE_SIZE;
  const markerX = world.x - topLeftX;
  const markerY = world.y - topLeftY;
  return {
    translateX: viewportWidth / 2 - markerX,
    translateY: viewportHeight / 2 - markerY,
  };
}

/** Carto Voyager tiles — OSM-based, works in React Native Image without an API key. */
export function buildTileUrl(x: number, y: number, z: number): string {
  return `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

export const TILE_PIXEL_SIZE = TILE_SIZE;
