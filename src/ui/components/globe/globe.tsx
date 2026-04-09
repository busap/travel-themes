"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import {
	TextureLoader,
	MeshPhongMaterial,
	MeshBasicMaterial,
	Raycaster,
	Vector2,
	Vector3,
	Sphere,
	type Material,
} from "three";
import type { GlobeInstance } from "globe.gl";

import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import { countryNameToId, idToCountryName } from "./country-map";
import styles from "./globe.module.scss";

// globe.gl uses a sphere of radius 100 in world space
const GLOBE_RADIUS = 100;
const globeSphere = new Sphere(new Vector3(0, 0, 0), GLOBE_RADIUS);
const raycaster = new Raycaster();

type GeoGeometry =
	| { type: "Polygon"; coordinates: number[][][] }
	| { type: "MultiPolygon"; coordinates: number[][][][] };

interface GeoFeature {
	type: string;
	id: string;
	properties: Record<string, unknown>;
	geometry: GeoGeometry;
}

interface CountryTrip {
	feature: GeoFeature;
	trip: Trip;
	countryName: string;
}

interface GlobeVisualizationProps {
	trips: Trip[];
	focusTripId?: string | null;
}

function computeCentroid(feature: GeoFeature): { lat: number; lng: number } {
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

	const lng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length;
	const lat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length;
	return { lat, lng };
}

const TOPO_JSON_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

// Default material for non-visited countries
const defaultMaterial = new MeshBasicMaterial({
	color: 0x1e293b,
	transparent: true,
	opacity: 0.15,
});

export function GlobeVisualization({ trips, focusTripId }: GlobeVisualizationProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const globeInstanceRef = useRef<GlobeInstance | null>(null);
	const materialCacheRef = useRef<Map<string, MeshPhongMaterial>>(new Map());
	const [countries, setCountries] = useState<GeoFeature[]>([]);
	const [hoveredCountry, setHoveredCountry] = useState<CountryTrip | null>(
		null
	);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const [isLoaded, setIsLoaded] = useState(false);
	const router = useRouter();
	const hoveredIdRef = useRef<string | null>(null);

	// Build a set of visited country ISO IDs and a map from ID → trip
	const { visitedIds, idToTrip, idToName } = useMemo(() => {
		const visited = new Set<string>();
		const tripMap = new Map<string, Trip>();
		const nameMap = new Map<string, string>();

		for (const trip of trips) {
			for (const country of trip.countries) {
				const id = countryNameToId[country];
				if (id) {
					visited.add(id);
					tripMap.set(id, trip);
					nameMap.set(id, country);
				}
			}
		}

		return { visitedIds: visited, idToTrip: tripMap, idToName: nameMap };
	}, [trips]);

	// Preload textures for visited countries
	useEffect(() => {
		const loader = new TextureLoader();
		const cache = materialCacheRef.current;

		for (const [id, trip] of idToTrip.entries()) {
			if (cache.has(id)) continue;

			const material = new MeshPhongMaterial({
				transparent: true,
				opacity: 0.65,
				color: 0xf59e0b,
			});
			cache.set(id, material);

			loader.load(trip.coverPhoto, (texture) => {
				material.map = texture;
				material.color.set(0xffffff);
				material.opacity = 0.45;
				material.needsUpdate = true;
			});
		}
	}, [idToTrip]);

	// Fetch country GeoJSON
	useEffect(() => {
		fetch(TOPO_JSON_URL)
			.then((res) => res.json())
			.then((topoData: Topology) => {
				const geoData = topojson.feature(
					topoData,
					topoData.objects.countries
				);
				if ("features" in geoData) {
					setCountries(geoData.features as unknown as GeoFeature[]);
				}
			});
	}, []);

	// Get material for a polygon
	const getMaterial = useCallback(
		(feat: GeoFeature): Material => {
			if (!visitedIds.has(feat.id)) return defaultMaterial;
			return materialCacheRef.current.get(feat.id) ?? defaultMaterial;
		},
		[visitedIds]
	);

	// Update hover highlight — defined at component level so focusTripId effect can call it too
	const updateHoverState = useCallback((hId: string | null) => {
		if (!globeInstanceRef.current) return;

		for (const [id, mat] of materialCacheRef.current.entries()) {
			mat.opacity = id === hId ? 0.85 : 0.45;
			mat.needsUpdate = true;
		}

		globeInstanceRef.current
			.polygonAltitude((d: object) => {
				const feat = d as GeoFeature;
				const isVisited = visitedIds.has(feat.id);
				const isHovered = feat.id === hId;
				if (isHovered && isVisited) return 0.02;
				if (isVisited) return 0.012;
				return 0.001;
			})
			.polygonStrokeColor((d: object) => {
				const feat = d as GeoFeature;
				const isVisited = visitedIds.has(feat.id);
				const isHovered = feat.id === hId;
				if (isHovered && isVisited) return "rgba(255, 235, 80, 1.0)";
				if (isVisited) return "rgba(200, 140, 30, 0.6)";
				return "rgba(148, 163, 184, 0.35)";
			});
	}, [visitedIds]);

	// Keep a ref so onPolygonHover (set during initGlobe) always calls the latest version
	const updateHoverStateRef = useRef(updateHoverState);
	useEffect(() => { updateHoverStateRef.current = updateHoverState; }, [updateHoverState]);

	// Initialize globe
	useEffect(() => {
		if (!containerRef.current || countries.length === 0) return;

		let globe: GlobeInstance | undefined;

		const initGlobe = async () => {
			const GlobeModule = await import("globe.gl");
			const Globe = GlobeModule.default;

			if (!containerRef.current) return;

			const width = containerRef.current.clientWidth;
			const height = containerRef.current.clientHeight;

			globe = new Globe(containerRef.current, {
				rendererConfig: {
					antialias: true,
					alpha: true,
				},
			});

			globeInstanceRef.current = globe;

			globe
				.width(width)
				.height(height)
				.backgroundColor("rgba(0,0,0,0)")
				.globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
				.showAtmosphere(true)
				.atmosphereColor("rgba(78, 167, 243, 0.25)")
				.atmosphereAltitude(0.18)
				.polygonsData(countries)
				.polygonCapMaterial((d: object) => getMaterial(d as GeoFeature))
				.polygonSideColor((d: object) => {
					const feat = d as GeoFeature;
					return visitedIds.has(feat.id)
						? "rgba(251, 191, 36, 0.3)"
						: "rgba(30, 41, 59, 0.02)";
				})
				.polygonStrokeColor((d: object) => {
					const feat = d as GeoFeature;
					return visitedIds.has(feat.id)
						? "rgba(200, 140, 30, 0.6)"
						: "rgba(148, 163, 184, 0.35)";
				})
				.polygonAltitude((d: object) => {
					const feat = d as GeoFeature;
					return visitedIds.has(feat.id) ? 0.012 : 0.001;
				})
				.polygonsTransitionDuration(300)
				.onPolygonHover((polygon: object | null) => {
					if (!polygon) {
						hoveredIdRef.current = null;
						setHoveredCountry(null);
						if (containerRef.current)
							containerRef.current.style.cursor = "default";
						updateHoverStateRef.current(null);
						return;
					}

					const feat = polygon as GeoFeature;
					const trip = idToTrip.get(feat.id);
					hoveredIdRef.current = feat.id;

					if (trip) {
						const name =
							idToName.get(feat.id) ??
							idToCountryName[feat.id] ??
							"";
						setHoveredCountry({
							feature: feat,
							trip,
							countryName: name,
						});
						if (containerRef.current)
							containerRef.current.style.cursor = "pointer";
					} else {
						setHoveredCountry(null);
						if (containerRef.current)
							containerRef.current.style.cursor = "default";
					}

					updateHoverStateRef.current(feat.id);
				})
				.onPolygonClick((polygon: object) => {
					const feat = polygon as GeoFeature;
					const trip = idToTrip.get(feat.id);
					if (trip) {
						router.push(getTripRoute(trip.id));
					}
				});

			// Auto-rotate and zoom
			const controls = globe.controls();
			controls.autoRotate = true;
			controls.autoRotateSpeed = 0.6;
			controls.enableZoom = true;
			controls.minDistance = 150;
			controls.maxDistance = 500;

			// Set initial camera angle
			globe.pointOfView({ lat: 20, lng: 15, altitude: 2.2 });

			setIsLoaded(true);
		};

		initGlobe();

		return () => {
			if (globe) {
				globe._destructor();
			}
		};
	}, [countries, visitedIds, idToTrip, idToName, getMaterial, router]);

	// React to focusTripId: rotate globe to that country and highlight it
	useEffect(() => {
		if (!globeInstanceRef.current || countries.length === 0) return;

		if (!focusTripId) {
			updateHoverState(null);
			const controls = globeInstanceRef.current.controls();
			if (controls) controls.autoRotate = true;
			globeInstanceRef.current.pointOfView({ altitude: 2.2 }, 800);
			return;
		}

		// Find country ID for this trip
		let targetCountryId: string | null = null;
		for (const [id, trip] of idToTrip.entries()) {
			if (trip.id === focusTripId) {
				targetCountryId = id;
				break;
			}
		}
		if (!targetCountryId) return;

		const feature = countries.find((f) => f.id === targetCountryId);
		if (!feature) return;

		const { lat, lng } = computeCentroid(feature);

		const controls = globeInstanceRef.current.controls();
		if (controls) controls.autoRotate = false;

		globeInstanceRef.current.pointOfView({ lat, lng, altitude: 1.4 }, 1000);
		updateHoverState(targetCountryId);
	}, [focusTripId, countries, idToTrip, updateHoverState]);

	// Track mouse position for tooltip + raycast to detect if over globe sphere
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		setTooltipPos({ x: e.clientX, y: e.clientY });

		if (!globeInstanceRef.current || !containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(new Vector2(x, y), globeInstanceRef.current.camera());
		const isOverGlobe = raycaster.ray.intersectSphere(globeSphere, new Vector3()) !== null;

		const controls = globeInstanceRef.current.controls();
		if (controls) controls.autoRotate = !isOverGlobe;
	}, []);


	// Handle resize
	useEffect(() => {
		const handleResize = () => {
			if (globeInstanceRef.current && containerRef.current) {
				globeInstanceRef.current
					.width(containerRef.current.clientWidth)
					.height(containerRef.current.clientHeight);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div
			className={styles.wrapper}
			onMouseMove={handleMouseMove}
		>
			<div
				ref={containerRef}
				className={`${styles.globe} ${isLoaded ? styles.loaded : ""}`}
			/>

			{hoveredCountry && (
				<div
					className={styles.tooltip}
					style={{
						left: tooltipPos.x + 16,
						top: tooltipPos.y - 16,
					}}
				>
					<div className={styles.tooltipImageWrapper}>
						<Image
							src={hoveredCountry.trip.coverPhoto}
							alt={hoveredCountry.trip.name}
							fill
							className={styles.tooltipImage}
							sizes="240px"
						/>
						<div className={styles.tooltipImageOverlay} />
					</div>
					<div className={styles.tooltipContent}>
						<span className={styles.tooltipName}>
							{hoveredCountry.trip.name}
						</span>
						<span className={styles.tooltipCountry}>
							{hoveredCountry.countryName}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
