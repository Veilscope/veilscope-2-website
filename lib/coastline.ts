import { globeConfig as config } from "./visual-config";

type Coordinate = number[];
type Geometry = { type: string; coordinates: Coordinate[] | Coordinate[][] };
export type Coastline = { features: { geometry: Geometry }[] };
export type Dot = { x: number; y: number; z: number; visibility: number; isPrimary: boolean };
const rad = Math.PI / 180;
const vector = ([lon, lat]: Coordinate) => [Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad), Math.cos(lat * rad) * Math.cos(lon * rad)];

export function buildDots(data: Coastline): Dot[] {
  const dots: Dot[] = [];
  const lon = config.orientation.longitude * rad;
  const lat = config.orientation.latitude * rad;
  function add(v: number[]) {
    const x = v[0] * Math.cos(lon) - v[2] * Math.sin(lon);
    const depth = v[0] * Math.sin(lon) + v[2] * Math.cos(lon);
    const y = v[1] * Math.cos(lat) - depth * Math.sin(lat);
    const z = v[1] * Math.sin(lat) + depth * Math.cos(lat);
    const edge = Math.min(1, Math.max(0, z / 0.075));
    dots.push({ x, y, z, visibility: edge * edge * (3 - 2 * edge), isPrimary: false });
  }
  const spacing = config.sampleSpacingDegrees * rad;
  for (const { geometry } of data.features) {
    const lines = geometry.type === "LineString" ? [geometry.coordinates as Coordinate[]] : geometry.type === "MultiLineString" ? geometry.coordinates as Coordinate[][] : [];
    for (const line of lines) {
      if (line.length < 2) continue;
      let remaining = 0;
      for (let i = 1; i < line.length; i++) {
        const a = vector(line[i - 1]);
        const b = vector(line[i]);
        // Great-circle interpolation naturally crosses the antimeridian on the short arc.
        const angle = Math.acos(Math.max(-1, Math.min(1, a.reduce((sum, v, j) => sum + v * b[j], 0))));
        if (angle < 1e-8) continue;
        while (remaining < angle) {
          const t = remaining / angle;
          const sa = Math.sin((1 - t) * angle) / Math.sin(angle);
          const sb = Math.sin(t * angle) / Math.sin(angle);
          add(a.map((v, j) => v * sa + b[j] * sb));
          remaining += spacing;
        }
        remaining -= angle;
      }
    }
  }
  const coastlineCount = dots.length;
  const count = Math.round(360 / config.silhouetteSpacingDegrees);
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2;
    dots.push({ x: Math.cos(angle), y: Math.sin(angle), z: 0, visibility: 1, isPrimary: false });
  }
  // Keep alternating samples, including the silhouette, without moving geography.
  const northernDots: Dot[] = [];
  const cluster = config.northernCluster;
  const sampled = dots.filter((dot, index) => {
    if (index % config.dotStride !== 0) return false;
    // Thin only crowded, visible northern coastlines; keep the silhouette intact.
    if (index < coastlineCount && dot.visibility > 0 && dot.y > cluster.minY && dot.x > cluster.minX && dot.x < cluster.maxX) {
      if (northernDots.some(other => Math.hypot(dot.x - other.x, dot.y - other.y) < cluster.minSpacing)) return false;
      northernDots.push(dot);
    }
    return true;
  });
  // Replace the nearest coastline sample with an exact, stable NYC anchor.
  add(vector([config.flight.focus.longitude, config.flight.focus.latitude]));
  const primary = { ...dots[dots.length - 1], isPrimary: true };
  let nearest = -1;
  let distance = Infinity;
  sampled.forEach((dot, index) => {
    if (dot.z === 0) return; // The silhouette is not geographic data.
    const candidate = Math.hypot(dot.x - primary.x, dot.y - primary.y, dot.z - primary.z);
    if (candidate < distance) { distance = candidate; nearest = index; }
  });
  if (nearest >= 0) sampled[nearest] = primary;
  else sampled.push(primary);
  return sampled;
}
