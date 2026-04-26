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

// Module-level singletons preserved across navigation so the globe doesn't
// reload from scratch when the user returns to the home page.
const _materialCache = new Map<string, MeshPhongMaterial>();
const _materialTextureSrcCache = new Map<string, string>();
let _texturesReady = false;
let _topoDataCache: GeoFeature[] | null = null;
let _globeCache: GlobeInstance | null = null;
let _activeContainer: HTMLDivElement | null = null;

const INTRO_CAMERA_ANIMATION_MS = 1500;

function normalizeCountryId(id: string | number): string {
	return String(id).padStart(3, "0");
}

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
	const materialCacheRef = useRef(_materialCache);
	const materialTextureSrcRef = useRef(_materialTextureSrcCache);
	const pendingStyleRefreshRef = useRef(false);
	const isMobileRef = useRef(isMobile);
	useEffect(() => {
		isMobileRef.current = isMobile;
	}, [isMobile]);
	// Initialize countries from cache so the first render already has data,
	// preventing a flash of an empty globe on reattach.
	const [countries, setCountries] = useState<GeoFeature[]>(
		_topoDataCache ?? []
	);
	const [activeCountry, setActiveCountry] = useState<CountryTrip | null>(
		null
	);
	const activeCountryRef = useRef<CountryTrip | null>(null);
	useEffect(() => {
		activeCountryRef.current = activeCountry;
	}, [activeCountry]);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const [isLoaded, setIsLoaded] = useState(false);
	const [isIntroComplete, setIsIntroComplete] = useState(false);
	const isIntroCompleteRef = useRef(false);
	useEffect(() => {
		isIntroCompleteRef.current = isIntroComplete;
	}, [isIntroComplete]);
	const router = useRouter();
	const routerRef = useRef(router);
	useEffect(() => {
		routerRef.current = router;
	}, [router]);
	const hoveredIdRef = useRef<string | null>(null);
	const introCompleteTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);
	const textureBatchIdRef = useRef(0);

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
	const visitedIdsRef = useRef(visitedIds);
	const idToTripRef = useRef(idToTrip);
	const idToNameRef = useRef(idToName);
	const countriesRef = useRef(countries);
	useEffect(() => {
		visitedIdsRef.current = visitedIds;
		idToTripRef.current = idToTrip;
		idToNameRef.current = idToName;
		countriesRef.current = countries;
	}, [visitedIds, idToTrip, idToName, countries]);

	useEffect(() => {
		if (_topoDataCache) {
			setCountries(_topoDataCache);
			return;
		}
		fetch(TOPO_JSON_URL)
			.then((res) => res.json())
			.then((topoData: Topology) => {
				const geoData = topojson.feature(
					topoData,
					topoData.objects.countries
				);
				if ("features" in geoData) {
					const features = geoData.features as unknown as GeoFeature[];
					_topoDataCache = features;
					setCountries(features);
				}
			});
	}, []);

	const getMaterial = useCallback((feat: GeoFeature): Material => {
		const countryId = normalizeCountryId(feat.id);
		if (!_texturesReady || !visitedIdsRef.current.has(countryId))
			return defaultMaterial;
		return materialCacheRef.current.get(countryId) ?? defaultMaterial;
	}, []);

	const applyPolygonStyleCallbacks = useCallback(() => {
		const globe = globeInstanceRef.current;
		if (!globe) {
			pendingStyleRefreshRef.current = true;
			return;
		}
		globe
			.polygonCapMaterial((d: object) => getMaterial(d as GeoFeature))
			.polygonSideColor((d: object) => {
				const feat = d as GeoFeature;
				return _texturesReady &&
					visitedIdsRef.current.has(normalizeCountryId(feat.id))
					? "rgba(251, 191, 36, 0.3)"
					: "rgba(30, 41, 59, 0.02)";
			})
			.polygonStrokeColor((d: object) => {
				const feat = d as GeoFeature;
				return _texturesReady &&
					visitedIdsRef.current.has(normalizeCountryId(feat.id))
					? "rgba(200, 140, 30, 0.6)"
					: "rgba(148, 163, 184, 0.35)";
			})
			.polygonAltitude((d: object) => {
				const feat = d as GeoFeature;
				return _texturesReady &&
					visitedIdsRef.current.has(normalizeCountryId(feat.id))
					? 0.012
					: 0.001;
			});
		pendingStyleRefreshRef.current = false;
	}, [getMaterial]);

	const applyCountriesData = useCallback(() => {
		const globe = globeInstanceRef.current;
		if (!globe) return;
		globe.polygonsData(countriesRef.current);
	}, []);

	const applyGlobeStyling = useCallback(() => {
		const globe = globeInstanceRef.current;
		if (!globe) {
			pendingStyleRefreshRef.current = true;
			return;
		}
		applyPolygonStyleCallbacks();
		applyCountriesData();
	}, [applyCountriesData, applyPolygonStyleCallbacks]);

	useEffect(() => {
		const loader = new TextureLoader();
		const cache = materialCacheRef.current;
		const textureSrcMap = materialTextureSrcRef.current;
		const currentBatchId = ++textureBatchIdRef.current;
		let remainingLoads = 0;

		// Phase 1: show default/empty globe while trip textures load.
		_texturesReady = false;
		applyGlobeStyling();

		for (const [id, trip] of idToTrip.entries()) {
			let material = cache.get(id);
			if (!material) {
				material = new MeshPhongMaterial({
					transparent: true,
					opacity: 0.65,
					color: 0xf59e0b,
				});
				cache.set(id, material);
			}

			const previousSrc = textureSrcMap.get(id);
			if (previousSrc === trip.coverPhoto && material.map) continue;
			textureSrcMap.set(id, trip.coverPhoto);
			remainingLoads += 1;

			loader.load(trip.coverPhoto, (texture) => {
				if (currentBatchId !== textureBatchIdRef.current) return;
				const currentMaterial = cache.get(id);
				if (!currentMaterial) return;
				currentMaterial.map = texture;
				currentMaterial.color.set(0xffffff);
				currentMaterial.opacity = 0.45;
				currentMaterial.needsUpdate = true;
				remainingLoads -= 1;
				if (remainingLoads === 0) {
					// Phase 2: all current trip textures ready; apply once.
					_texturesReady = true;
					if (isIntroCompleteRef.current) {
						applyPolygonStyleCallbacks();
						applyCountriesData();
					} else {
						pendingStyleRefreshRef.current = true;
					}
				}
			});
		}

		if (remainingLoads === 0) {
			_texturesReady = idToTrip.size > 0;
			if (isIntroCompleteRef.current) {
				applyPolygonStyleCallbacks();
				applyCountriesData();
			} else {
				pendingStyleRefreshRef.current = true;
			}
		}
	}, [
		applyCountriesData,
		applyGlobeStyling,
		applyPolygonStyleCallbacks,
		idToTrip,
	]);

	const updateHoverState = useCallback((hId: string | null) => {
		if (!globeInstanceRef.current) return;

		for (const [id, mat] of materialCacheRef.current.entries()) {
			mat.opacity = id === hId ? 0.85 : 0.45;
			mat.needsUpdate = true;
		}

		globeInstanceRef.current
			.polygonAltitude((d: object) => {
				const feat = d as GeoFeature;
				const countryId = normalizeCountryId(feat.id);
				const isVisited = visitedIdsRef.current.has(countryId);
				const isHovered = countryId === hId;
				if (isHovered && isVisited) return 0.02;
				if (isVisited) return 0.012;
				return 0.001;
			})
			.polygonStrokeColor((d: object) => {
				const feat = d as GeoFeature;
				const countryId = normalizeCountryId(feat.id);
				const isVisited = visitedIdsRef.current.has(countryId);
				const isHovered = countryId === hId;
				if (isHovered && isVisited) return "rgba(255, 235, 80, 1.0)";
				if (isVisited) return "rgba(200, 140, 30, 0.6)";
				return "rgba(148, 163, 184, 0.35)";
			});
	}, []);

	const updateHoverStateRef = useRef(updateHoverState);
	useEffect(() => {
		updateHoverStateRef.current = updateHoverState;
	}, [updateHoverState]);

	useEffect(() => {
		applyPolygonStyleCallbacks();
	}, [applyPolygonStyleCallbacks, visitedIds]);

	useEffect(() => {
		applyCountriesData();
	}, [applyCountriesData, countries]);

	useEffect(() => {
		if (!containerRef.current) return;

		// REATTACH: Globe was previously initialized — reuse the cached instance.
		if (_globeCache) {
			const globe = _globeCache;
			containerRef.current.appendChild(globe.renderer().domElement);
			globe
				.width(containerRef.current.clientWidth)
				.height(containerRef.current.clientHeight);
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = true;
				controls.autoRotateSpeed = 0.6;
			}
			globeInstanceRef.current = globe;
			_activeContainer = containerRef.current;
			hoveredIdRef.current = null;
			setActiveCountry(null);
			updateHoverStateRef.current(null);
			applyGlobeStyling();
			setIsLoaded(true);
			setIsIntroComplete(true);
			isIntroCompleteRef.current = true;

			return () => {
				_activeContainer = null;
				if (introCompleteTimeoutRef.current) {
					clearTimeout(introCompleteTimeoutRef.current);
					introCompleteTimeoutRef.current = null;
				}
			};
		}

		// FRESH INIT
		let globe: GlobeInstance | undefined;
		setIsLoaded(false);
		setIsIntroComplete(false);
		isIntroCompleteRef.current = false;

		const initGlobe = async () => {
			const GlobeModule = await import("globe.gl");
			const Globe = GlobeModule.default;

			if (!containerRef.current) return;

			globe = new Globe(containerRef.current, {
				rendererConfig: { antialias: true, alpha: true },
			});

			globeInstanceRef.current = globe;
			_activeContainer = containerRef.current;

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
					return visitedIdsRef.current.has(
						normalizeCountryId(feat.id)
					)
						? "rgba(251, 191, 36, 0.3)"
						: "rgba(30, 41, 59, 0.02)";
				})
				.polygonStrokeColor((d: object) => {
					const feat = d as GeoFeature;
					return visitedIdsRef.current.has(
						normalizeCountryId(feat.id)
					)
						? "rgba(200, 140, 30, 0.6)"
						: "rgba(148, 163, 184, 0.35)";
				})
				.polygonAltitude((d: object) => {
					const feat = d as GeoFeature;
					return visitedIdsRef.current.has(
						normalizeCountryId(feat.id)
					)
						? 0.012
						: 0.001;
				})
				.polygonsTransitionDuration(300)
				.onPolygonHover((polygon: object | null) => {
					if (isMobileRef.current) return;

					if (!polygon) {
						hoveredIdRef.current = null;
						setActiveCountry(null);
						if (_activeContainer)
							_activeContainer.style.cursor = "default";
						updateHoverStateRef.current(null);
						return;
					}

					const feat = polygon as GeoFeature;
					const countryId = normalizeCountryId(feat.id);
					const trip = idToTripRef.current.get(countryId);
					hoveredIdRef.current = countryId;

					if (trip) {
						const name =
							idToNameRef.current.get(countryId) ??
							idToCountryName[countryId] ??
							"";
						setActiveCountry({
							feature: feat,
							trip,
							countryName: name,
						});
						if (_activeContainer)
							_activeContainer.style.cursor = "pointer";
					} else {
						setActiveCountry(null);
						if (_activeContainer)
							_activeContainer.style.cursor = "default";
					}

					updateHoverStateRef.current(countryId);
				})
				.onPolygonClick((polygon: object) => {
					const feat = polygon as GeoFeature;
					const countryId = normalizeCountryId(feat.id);
					const trip = idToTripRef.current.get(countryId);

					if (!isMobileRef.current) {
						if (trip) routerRef.current.push(getTripRoute(trip.id));
						return;
					}

					if (!trip) {
						setActiveCountry(null);
						updateHoverStateRef.current(null);
						return;
					}

					const alreadyShowing =
						normalizeCountryId(
							activeCountryRef.current?.feature.id ?? ""
						) === countryId;
					if (alreadyShowing) {
						setActiveCountry(null);
						updateHoverStateRef.current(null);
						return;
					}

					const name =
						idToNameRef.current.get(countryId) ??
						idToCountryName[countryId] ??
						"";
					setActiveCountry({
						feature: feat,
						trip,
						countryName: name,
					});
					updateHoverStateRef.current(countryId);
				});

			if (pendingStyleRefreshRef.current) {
				applyGlobeStyling();
			}

			const controls = globe.controls();
			controls.autoRotate = true;
			controls.autoRotateSpeed = 0.6;
			controls.enableZoom = true;
			controls.minDistance = 150;
			controls.maxDistance = 500;

			globe.pointOfView({
				lat: 20,
				lng: 15 - 90,
				altitude: isMobileRef.current ? 4 : 2.2,
			});

			globe.onGlobeReady(() => {
				setIsLoaded(true);
				applyGlobeStyling();
				globe!.pointOfView(
					{
						lat: 20,
						lng: 15,
						altitude: isMobileRef.current ? 4 : 2.2,
					},
					INTRO_CAMERA_ANIMATION_MS
				);

				// Cache as soon as the globe is ready so back-navigation is instant
				// even if the user leaves during the intro camera animation.
				_globeCache = globe!;

				introCompleteTimeoutRef.current = setTimeout(() => {
					setIsIntroComplete(true);
					isIntroCompleteRef.current = true;
					const readyControls = globe!.controls();
					if (readyControls) readyControls.autoRotate = true;
					if (pendingStyleRefreshRef.current) {
						applyGlobeStyling();
					}
				}, INTRO_CAMERA_ANIMATION_MS);
			});
		};

		initGlobe();

		return () => {
			_activeContainer = null;
			if (introCompleteTimeoutRef.current) {
				clearTimeout(introCompleteTimeoutRef.current);
				introCompleteTimeoutRef.current = null;
			}
			if (_globeCache) {
				// Globe is preserved in cache — React will detach the canvas
				// when it removes the container from the DOM. The GlobeInstance
				// and its WebGL context stay alive for reattachment.
			} else if (globe) {
				// Globe never finished initializing — destroy it cleanly.
				globe._destructor();
			}
		};
	}, [applyGlobeStyling, getMaterial]);

	useEffect(() => {
		if (
			!isIntroComplete ||
			!globeInstanceRef.current ||
			countries.length === 0
		)
			return;

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
		for (const [id, trip] of idToTripRef.current.entries()) {
			if (trip.id === focusTripId) {
				targetCountryId = id;
				break;
			}
		}
		if (!targetCountryId) return;

		const feature = countries.find(
			(f) => normalizeCountryId(f.id) === targetCountryId
		);
		if (!feature) return;

		const { lat, lng } = computeCentroid(feature);

		const controls = globeInstanceRef.current.controls();
		if (controls) controls.autoRotate = false;

		globeInstanceRef.current.pointOfView({ lat, lng, altitude: 1.4 }, 1000);
		updateHoverState(targetCountryId);
	}, [focusTripId, countries, updateHoverState, isIntroComplete, isMobile]);

	const clearActiveCountry = useCallback(() => {
		setActiveCountry(null);
		updateHoverStateRef.current(null);
	}, []);

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
