"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import {
	TextureLoader,
	MeshPhongMaterial,
	MeshBasicMaterial,
	type Material,
} from "three";
import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import { countryNameToId, idToCountryName } from "./country-map";
import styles from "./globe.module.scss";

interface GeoFeature {
	type: string;
	id: string;
	properties: Record<string, unknown>;
	geometry: {
		type: string;
		coordinates: number[][][];
	};
}

interface CountryTrip {
	feature: GeoFeature;
	trip: Trip;
	countryName: string;
}

interface GlobeVisualizationProps {
	trips: Trip[];
}

const GLOBE_IMAGE = "//unpkg.com/three-globe/example/img/earth-night.jpg";
const TOPO_JSON_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

// Default material for non-visited countries
const defaultMaterial = new MeshBasicMaterial({
	color: 0x1e293b,
	transparent: true,
	opacity: 0.15,
});

export function GlobeVisualization({ trips }: GlobeVisualizationProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const globeInstanceRef = useRef<any>(null);
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
				opacity: 0.45,
				color: 0xf59e0b,
			});
			cache.set(id, material);

			loader.load(trip.coverPhoto, (texture) => {
				material.map = texture;
				material.color.set(0xffffff);
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

	// Initialize globe
	useEffect(() => {
		if (!containerRef.current || countries.length === 0) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let globe: any;

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
				.globeImageUrl(GLOBE_IMAGE)
				.showAtmosphere(true)
				.atmosphereColor("rgba(78, 167, 243, 0.25)")
				.atmosphereAltitude(0.18)
				.polygonsData(countries)
				.polygonCapMaterial((d: object) => getMaterial(d as GeoFeature))
				.polygonSideColor((d: object) => {
					const feat = d as GeoFeature;
					return visitedIds.has(feat.id)
						? "rgba(245, 158, 11, 0.3)"
						: "rgba(30, 41, 59, 0.05)";
				})
				.polygonStrokeColor((d: object) => {
					const feat = d as GeoFeature;
					return visitedIds.has(feat.id)
						? "rgba(251, 191, 36, 0.8)"
						: "rgba(148, 163, 184, 0.15)";
				})
				.polygonAltitude((d: object) => {
					const feat = d as GeoFeature;
					return visitedIds.has(feat.id) ? 0.02 : 0.005;
				})
				.polygonsTransitionDuration(300)
				.onPolygonHover((polygon: object | null) => {
					if (!polygon) {
						hoveredIdRef.current = null;
						setHoveredCountry(null);
						if (containerRef.current)
							containerRef.current.style.cursor = "default";
						updateHoverState(null);
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

					updateHoverState(feat.id);
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
			controls.minDistance = 120;
			controls.maxDistance = 500;

			// Set initial camera angle
			globe.pointOfView({ lat: 20, lng: 15, altitude: 2.2 });

			setIsLoaded(true);
		};

		// Update material opacity and polygon altitude on hover
		const updateHoverState = (hId: string | null) => {
			if (!globeInstanceRef.current) return;

			// Update material opacities
			for (const [id, mat] of materialCacheRef.current.entries()) {
				mat.opacity = id === hId ? 0.85 : 0.45;
				mat.needsUpdate = true;
			}

			globeInstanceRef.current
				.polygonAltitude((d: object) => {
					const feat = d as GeoFeature;
					const isVisited = visitedIds.has(feat.id);
					const isHovered = feat.id === hId;

					if (isHovered && isVisited) return 0.04;
					if (isVisited) return 0.02;
					return 0.005;
				})
				.polygonStrokeColor((d: object) => {
					const feat = d as GeoFeature;
					const isVisited = visitedIds.has(feat.id);
					const isHovered = feat.id === hId;

					if (isHovered && isVisited) return "rgba(253, 224, 71, 1)";
					if (isVisited) return "rgba(251, 191, 36, 0.8)";
					return "rgba(148, 163, 184, 0.15)";
				});
		};

		initGlobe();

		return () => {
			if (globe) {
				globe._destructor();
			}
		};
	}, [countries, visitedIds, idToTrip, idToName, getMaterial, router]);

	// Track mouse position for tooltip
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		setTooltipPos({ x: e.clientX, y: e.clientY });
	}, []);

	// Pause auto-rotation when hovering over the globe
	const handleMouseEnter = useCallback(() => {
		const controls = globeInstanceRef.current?.controls();
		if (controls) controls.autoRotate = false;
	}, []);

	const handleMouseLeave = useCallback(() => {
		const controls = globeInstanceRef.current?.controls();
		if (controls) controls.autoRotate = true;
		setHoveredCountry(null);
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
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
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
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={hoveredCountry.trip.coverPhoto}
							alt={hoveredCountry.trip.name}
							className={styles.tooltipImage}
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
