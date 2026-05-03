import { MeshBasicMaterial, Raycaster, Sphere, Vector3 } from "three";
import { Trip } from "@/types/trip";

export type GeoGeometry =
	| { type: "Polygon"; coordinates: number[][][] }
	| { type: "MultiPolygon"; coordinates: number[][][][] };

export interface GeoFeature {
	type: string;
	id: string;
	properties: Record<string, unknown>;
	geometry: GeoGeometry;
}

export interface CountryTrip {
	feature: GeoFeature;
	trips: Trip[];
	countryName: string;
}

export const TOPO_JSON_URL =
	"https://unpkg.com/world-atlas@2/countries-110m.json";

// globe.gl uses a sphere of radius 100 in world space
export const GLOBE_RADIUS = 100;
export const globeSphere = new Sphere(new Vector3(0, 0, 0), GLOBE_RADIUS);
export const raycaster = new Raycaster();

export const defaultMaterial = new MeshBasicMaterial({
	color: 0x1e293b,
	transparent: true,
	opacity: 0.15,
});

export function computeCentroid(feature: GeoFeature): {
	lat: number;
	lng: number;
} {
	const geom = feature.geometry;
	let ring: number[][];

	if (geom.type === "Polygon") {
		ring = geom.coordinates[0];
	} else {
		// MultiPolygon — pick the largest ring
		ring = geom.coordinates.reduce(
			(best: number[][], poly: number[][][]) =>
				poly[0].length > best.length ? poly[0] : best,
			[] as number[][]
		);
	}

	const lng =
		ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length;
	const lat =
		ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length;
	return { lat, lng };
}
