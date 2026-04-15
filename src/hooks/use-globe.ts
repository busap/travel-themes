import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import {
	TextureLoader,
	MeshPhongMaterial,
	Vector2,
	Vector3,
	type Material,
} from "three";
import type { GlobeInstance } from "globe.gl";

import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import {
	computeCentroid,
	defaultMaterial,
	type CountryTrip,
	type GeoFeature,
	globeSphere,
	raycaster,
	TOPO_JSON_URL,
} from "@/utils/globe";
import { countryCodeToId, idToCountryName } from "@/utils/globe-country-map";
import { getCountryName } from "@/utils/country";

interface UseGlobeProps {
	trips: Trip[];
	focusTripId?: string | null;
	isMobile?: boolean;
}

interface UseGlobeReturn {
	containerRef: React.RefObject<HTMLDivElement | null>;
	isLoaded: boolean;
	activeCountry: CountryTrip | null;
	tooltipPos: { x: number; y: number };
	handleMouseMove: (e: React.MouseEvent) => void;
	clearActiveCountry: () => void;
}

export function useGlobe({
	trips,
	focusTripId,
	isMobile = false,
}: UseGlobeProps): UseGlobeReturn {
	const containerRef = useRef<HTMLDivElement>(null);
	const globeInstanceRef = useRef<GlobeInstance | null>(null);
	const materialCacheRef = useRef<Map<string, MeshPhongMaterial>>(new Map());
	const isMobileRef = useRef(isMobile);
	useEffect(() => {
		isMobileRef.current = isMobile;
	}, [isMobile]);
	const [countries, setCountries] = useState<GeoFeature[]>([]);
	const [activeCountry, setActiveCountry] = useState<CountryTrip | null>(
		null
	);
	const activeCountryRef = useRef<CountryTrip | null>(null);
	useEffect(() => {
		activeCountryRef.current = activeCountry;
	}, [activeCountry]);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const [isLoaded, setIsLoaded] = useState(false);
	const router = useRouter();
	const hoveredIdRef = useRef<string | null>(null);

	const { visitedIds, idToTrip, idToName } = useMemo(() => {
		const visited = new Set<string>();
		const tripMap = new Map<string, Trip>();
		const nameMap = new Map<string, string>();

		for (const trip of trips) {
			for (const country of trip.countries) {
				const id = countryCodeToId[country];
				if (id) {
					visited.add(id);
					tripMap.set(id, trip);
					nameMap.set(id, getCountryName(country));
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

	const getMaterial = useCallback(
		(feat: GeoFeature): Material => {
			if (!visitedIds.has(feat.id)) return defaultMaterial;
			return materialCacheRef.current.get(feat.id) ?? defaultMaterial;
		},
		[visitedIds]
	);

	const updateHoverState = useCallback(
		(hId: string | null) => {
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
					if (isHovered && isVisited)
						return "rgba(255, 235, 80, 1.0)";
					if (isVisited) return "rgba(200, 140, 30, 0.6)";
					return "rgba(148, 163, 184, 0.35)";
				});
		},
		[visitedIds]
	);

	// Keep a ref so onPolygonHover (registered once during init) always calls the latest version
	const updateHoverStateRef = useRef(updateHoverState);
	useEffect(() => {
		updateHoverStateRef.current = updateHoverState;
	}, [updateHoverState]);

	useEffect(() => {
		if (!globeInstanceRef.current || countries.length === 0) return;
		globeInstanceRef.current.polygonsData(countries);
	}, [countries, isLoaded]);

	// Initialize globe
	useEffect(() => {
		if (!containerRef.current) return;

		let globe: GlobeInstance | undefined;

		const initGlobe = async () => {
			const GlobeModule = await import("globe.gl");
			const Globe = GlobeModule.default;

			if (!containerRef.current) return;

			globe = new Globe(containerRef.current, {
				rendererConfig: { antialias: true, alpha: true },
			});

			globeInstanceRef.current = globe;

			globe
				.width(containerRef.current.clientWidth)
				.height(containerRef.current.clientHeight)
				.backgroundColor("rgba(0,0,0,0)")
				.globeImageUrl(
					"//unpkg.com/three-globe/example/img/earth-night.jpg"
				)
				.showAtmosphere(true)
				.atmosphereColor("rgba(78, 167, 243, 0.25)")
				.atmosphereAltitude(0.18)
				.polygonsData([])
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
					if (isMobileRef.current) return;

					if (!polygon) {
						hoveredIdRef.current = null;
						setActiveCountry(null);
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
						setActiveCountry({
							feature: feat,
							trip,
							countryName: name,
						});
						if (containerRef.current)
							containerRef.current.style.cursor = "pointer";
					} else {
						setActiveCountry(null);
						if (containerRef.current)
							containerRef.current.style.cursor = "default";
					}

					updateHoverStateRef.current(feat.id);
				})
				.onPolygonClick((polygon: object) => {
					const feat = polygon as GeoFeature;
					const trip = idToTrip.get(feat.id);

					if (!isMobileRef.current) {
						if (trip) router.push(getTripRoute(trip.id));
						return;
					}

					// Mobile: first tap shows card, second tap on same country navigates
					if (!trip) {
						setActiveCountry(null);
						updateHoverStateRef.current(null);
						return;
					}

					const alreadyShowing =
						activeCountryRef.current?.feature.id === feat.id;
					if (alreadyShowing) {
						setActiveCountry(null);
						updateHoverStateRef.current(null);
						return;
					}

					const name =
						idToName.get(feat.id) ?? idToCountryName[feat.id] ?? "";
					setActiveCountry({
						feature: feat,
						trip,
						countryName: name,
					});
					updateHoverStateRef.current(feat.id);
				});

			const controls = globe.controls();
			controls.autoRotate = true;
			controls.autoRotateSpeed = 0.6;
			controls.enableZoom = true;
			controls.minDistance = 150;
			controls.maxDistance = 500;

			// Start 90° offset so the rotate-in animation is visible
			globe.pointOfView({
				lat: 20,
				lng: 15 - 90,
				altitude: isMobileRef.current ? 4 : 2.2,
			});

			globe.onGlobeReady(() => {
				// Animate to final position once the globe is fully initialised
				globe!.pointOfView(
					{
						lat: 20,
						lng: 15,
						altitude: isMobileRef.current ? 4 : 2.2,
					},
					1500
				);
				setIsLoaded(true);
			});
		};

		initGlobe();

		return () => {
			if (globe) globe._destructor();
		};
	}, [visitedIds, idToTrip, idToName, getMaterial, router]);

	// React to focusTripId: rotate globe to that country and highlight it
	useEffect(() => {
		if (!globeInstanceRef.current || countries.length === 0) return;

		if (!focusTripId) {
			updateHoverState(null);
			const controls = globeInstanceRef.current.controls();
			if (controls) controls.autoRotate = true;
			globeInstanceRef.current.pointOfView(
				{ altitude: isMobileRef.current ? 1.6 : 2.2 },
				800
			);
			return;
		}

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
	}, [focusTripId, countries, idToTrip, updateHoverState, isMobile]);

	const clearActiveCountry = useCallback(() => {
		setActiveCountry(null);
		updateHoverStateRef.current(null);
	}, []);

	// Pause auto-rotate when mouse is over the globe sphere; resume when it leaves
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		setTooltipPos({ x: e.clientX, y: e.clientY });

		if (!globeInstanceRef.current || !containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(
			new Vector2(x, y),
			globeInstanceRef.current.camera()
		);
		const isOverGlobe =
			raycaster.ray.intersectSphere(globeSphere, new Vector3()) !== null;

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

	return {
		containerRef,
		isLoaded,
		activeCountry,
		tooltipPos,
		handleMouseMove,
		clearActiveCountry,
	};
}
