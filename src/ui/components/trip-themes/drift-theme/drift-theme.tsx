"use client";

import { Trip } from "@/types/trip";
import { Photo } from "@/types/photo";
import { ThemeConfig } from "@/config/theme-config";
import { getCountryNames } from "@/utils/country";
import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { Playfair_Display, Crimson_Pro } from "next/font/google";
import { seededRandom } from "@/utils/random";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./drift-theme.module.scss";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

const playfair = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const crimson = Crimson_Pro({
	subsets: ["latin"],
	weight: ["300", "400", "500"],
	display: "swap",
});

interface DriftThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

type SlideDirection = "left" | "right" | "top" | "bottom";

type CompositionKey =
	| "single-left"
	| "single-right"
	| "single-center"
	| "duo-staggered"
	| "duo-big-small-left"
	| "duo-big-small-right"
	| "duo-diagonal"
	| "trio-one-two"
	| "trio-two-one"
	| "trio-l-shape";

interface Wave {
	photos: Photo[];
	compositionKey: CompositionKey;
	directions: SlideDirection[];
	rotations: number[];
}

interface WaveSectionAnimConfig {
	duration: number;
	ease: string;
	stagger: number;
	triggerStart: string;
}

const SINGLE_COMPOSITIONS: CompositionKey[] = [
	"single-left",
	"single-right",
	"single-center",
];
const DUO_COMPOSITIONS: CompositionKey[] = [
	"duo-staggered",
	"duo-big-small-left",
	"duo-big-small-right",
	"duo-diagonal",
];
const TRIO_COMPOSITIONS: CompositionKey[] = [
	"trio-one-two",
	"trio-two-one",
	"trio-l-shape",
];
const DIRECTIONS: SlideDirection[] = ["left", "right", "top", "bottom"];

const COMPOSITION_CLASS_MAP: Record<CompositionKey, string> = {
	"single-left": styles.singleLeft,
	"single-right": styles.singleRight,
	"single-center": styles.singleCenter,
	"duo-staggered": styles.duoStaggered,
	"duo-big-small-left": styles.duoBigSmallLeft,
	"duo-big-small-right": styles.duoBigSmallRight,
	"duo-diagonal": styles.duoDiagonal,
	"trio-one-two": styles.trioOneTwo,
	"trio-two-one": styles.trioTwoOne,
	"trio-l-shape": styles.trioLShape,
};

function getDirectionOffset(direction: SlideDirection): {
	x: number;
	y: number;
} {
	switch (direction) {
		case "left":
			return { x: -250, y: 0 };
		case "right":
			return { x: 250, y: 0 };
		case "top":
			return { x: 0, y: -180 };
		case "bottom":
			return { x: 0, y: 180 };
	}
}

interface WaveSectionProps {
	wave: Wave;
	waveIndex: number;
	isFirstWave: boolean;
	animConfig: WaveSectionAnimConfig;
	crimsonClassName: string;
	onReady?: () => void;
}

function WaveSection({
	wave,
	waveIndex,
	isFirstWave,
	animConfig,
	crimsonClassName,
	onReady,
}: WaveSectionProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const hasAnimatedRef = useRef(false);

	// First wave is always mounted; others start unmounted and are controlled
	// by a bidirectional IntersectionObserver with a generous rootMargin so
	// the DOM window around the visible area stays small on long trips.
	const [isMounted, setIsMounted] = useState(isFirstWave);

	useEffect(() => {
		if (isFirstWave) return;
		const section = sectionRef.current;
		if (!section) return;

		const observer = new IntersectionObserver(
			([entry]) => setIsMounted(entry.isIntersecting),
			{ rootMargin: "500px 0px" }
		);
		observer.observe(section);
		return () => observer.disconnect();
	}, [isFirstWave]);

	// Set up GSAP when images mount. On remount after a virtual unmount,
	// skip the entrance animation and show photos at their final state.
	// Cleanup kills the timeline so strict-mode double-invocation works cleanly.
	useEffect(() => {
		if (!isMounted || !sectionRef.current) return;

		const section = sectionRef.current;
		const photos = section.querySelectorAll<Element>(
			'[data-entrance="photo"]'
		);
		const captions = section.querySelectorAll<Element>(
			'[data-entrance="caption"]'
		);

		const prefersReduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (prefersReduced || hasAnimatedRef.current) {
			gsap.set([...Array.from(photos), ...Array.from(captions)], {
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
			});
			onReady?.();
			return;
		}

		// Set initial hidden state so photos are invisible before animation
		photos.forEach((photo) => {
			const dir = (photo.getAttribute("data-direction") ||
				"bottom") as SlideDirection;
			const offset = getDirectionOffset(dir);
			gsap.set(photo, { opacity: 0, x: offset.x, y: offset.y, scale: 0.92 });
		});
		gsap.set([...Array.from(captions)], { opacity: 0, y: 10 });

		// For wave 0: signal the container to become visible now that photos are hidden
		onReady?.();
		hasAnimatedRef.current = true;

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: section,
				start: animConfig.triggerStart,
				toggleActions: "play none none none",
				once: true,
			},
		});

		photos.forEach((photo, i) => {
			tl.to(
				photo,
				{
					opacity: 1,
					x: 0,
					y: 0,
					scale: 1,
					duration: animConfig.duration,
					ease: animConfig.ease,
				},
				i * animConfig.stagger
			);
		});

		captions.forEach((caption, i) => {
			tl.to(
				caption,
				{
					opacity: 1,
					y: 0,
					duration: 0.4,
					ease: "power2.out",
				},
				i * animConfig.stagger + 0.3
			);
		});

		return () => {
			tl.scrollTrigger?.kill();
			tl.kill();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMounted]);

	const renderPhoto = (
		photo: Photo,
		rotation: number,
		direction: SlideDirection,
		photoIndex: number
	) => (
		<div
			key={`${photo.src}-${photoIndex}`}
			data-entrance="photo"
			data-direction={direction}
			className={styles.photo}
			style={{ transform: `rotate(${rotation}deg)` }}
		>
			<div className={styles.photoMedia}>
				<Image
					src={photo.src}
					alt={photo.title || `Photo ${photoIndex + 1}`}
					className={styles.photoImage}
					fill
					sizes="(max-width: 768px) 90vw, 550px"
					priority={isFirstWave && photoIndex === 0}
					loading={!isFirstWave ? "lazy" : undefined}
				/>
			</div>
			{photo.title && (
				<p
					data-entrance="caption"
					className={`${styles.caption} ${crimsonClassName}`}
				>
					{photo.title}
				</p>
			)}
		</div>
	);

	const compositionClass = COMPOSITION_CLASS_MAP[wave.compositionKey];

	const renderImages = () => {
		if (!isMounted) return null;

		if (wave.compositionKey === "trio-one-two") {
			return (
				<div className={compositionClass}>
					{renderPhoto(
						wave.photos[0],
						wave.rotations[0],
						wave.directions[0],
						0
					)}
					<div className={styles.trioBottomRow}>
						{renderPhoto(
							wave.photos[1],
							wave.rotations[1],
							wave.directions[1],
							1
						)}
						{renderPhoto(
							wave.photos[2],
							wave.rotations[2],
							wave.directions[2],
							2
						)}
					</div>
				</div>
			);
		}

		if (wave.compositionKey === "trio-two-one") {
			return (
				<div className={compositionClass}>
					<div className={styles.trioTopRow}>
						{renderPhoto(
							wave.photos[0],
							wave.rotations[0],
							wave.directions[0],
							0
						)}
						{renderPhoto(
							wave.photos[1],
							wave.rotations[1],
							wave.directions[1],
							1
						)}
					</div>
					{renderPhoto(
						wave.photos[2],
						wave.rotations[2],
						wave.directions[2],
						2
					)}
				</div>
			);
		}

		if (wave.compositionKey === "trio-l-shape") {
			return (
				<div className={compositionClass}>
					{renderPhoto(
						wave.photos[0],
						wave.rotations[0],
						wave.directions[0],
						0
					)}
					<div className={styles.trioRightStack}>
						{renderPhoto(
							wave.photos[1],
							wave.rotations[1],
							wave.directions[1],
							1
						)}
						{renderPhoto(
							wave.photos[2],
							wave.rotations[2],
							wave.directions[2],
							2
						)}
					</div>
				</div>
			);
		}

		return (
			<div className={compositionClass}>
				{wave.photos.map((photo, i) =>
					renderPhoto(photo, wave.rotations[i], wave.directions[i], i)
				)}
			</div>
		);
	};

	return (
		<section
			ref={sectionRef}
			data-wave={waveIndex}
			className={styles.wave}
		>
			{renderImages()}
		</section>
	);
}

export function DriftTheme({ trip, config }: DriftThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const duration = config.animation?.timeline?.duration ?? 0.8;
	const ease = config.animation?.timeline?.ease ?? "power3.out";
	const stagger = config.animation?.timeline?.stagger ?? 0.12;
	const triggerStart = config.animation?.scrollTrigger?.start ?? "top 60%";
	const titleClasses = "text-5xl font-light tracking-wide";
	const bodyClasses = "text-lg text-zinc-600";

	const animConfig = useMemo<WaveSectionAnimConfig>(
		() => ({ duration, ease, stagger, triggerStart }),
		[duration, ease, stagger, triggerStart]
	);

	const idSeed = useMemo(() => {
		let hash = 0;
		for (let i = 0; i < trip.id.length; i++) {
			hash = (hash << 5) - hash + trip.id.charCodeAt(i);
			hash |= 0;
		}
		return Math.abs(hash);
	}, [trip.id]);

	const waves = useMemo(() => {
		const activePhotos = trip.photos;
		const result: Wave[] = [];
		let photoIndex = 0;
		let waveIndex = 0;

		while (photoIndex < activePhotos.length) {
			const remaining = activePhotos.length - photoIndex;

			const groupRand = seededRandom(idSeed + waveIndex * 53.7);
			let groupSize: number;
			if (remaining === 1) {
				groupSize = 1;
			} else if (remaining === 2) {
				groupSize = 2;
			} else if (remaining === 3) {
				groupSize = 3;
			} else if (remaining === 4) {
				groupSize = 2;
			} else {
				if (groupRand < 0.3) groupSize = 1;
				else if (groupRand < 0.75) groupSize = 2;
				else groupSize = 3;
			}

			const wavePhotos = activePhotos.slice(
				photoIndex,
				photoIndex + groupSize
			);

			const compRand = seededRandom(idSeed + waveIndex * 71.3);
			let compositionKey: CompositionKey;
			if (groupSize === 1) {
				compositionKey =
					SINGLE_COMPOSITIONS[
						Math.floor(compRand * SINGLE_COMPOSITIONS.length)
					];
			} else if (groupSize === 2) {
				compositionKey =
					DUO_COMPOSITIONS[
						Math.floor(compRand * DUO_COMPOSITIONS.length)
					];
			} else {
				compositionKey =
					TRIO_COMPOSITIONS[
						Math.floor(compRand * TRIO_COMPOSITIONS.length)
					];
			}

			const directions: SlideDirection[] = wavePhotos.map((_, i) => {
				const dirRand = seededRandom(idSeed + (photoIndex + i) * 29.3);
				return DIRECTIONS[Math.floor(dirRand * DIRECTIONS.length)];
			});

			const rotations: number[] = wavePhotos.map((_, i) => {
				const rotRand = seededRandom(idSeed + (photoIndex + i) * 17.3);
				return Math.round((rotRand * 4 - 2) * 100) / 100;
			});

			result.push({
				photos: wavePhotos,
				compositionKey,
				directions,
				rotations,
			});
			photoIndex += groupSize;
			waveIndex++;
		}

		return result;
	}, [trip.photos, idSeed]);

	// Reveal container once first wave has hidden its photos via GSAP
	const showContainer = useCallback(() => {
		if (containerRef.current) {
			containerRef.current.style.visibility = "visible";
		}
	}, []);

	// Animate header; show container immediately for edge cases (no waves / reduced motion)
	useEffect(() => {
		if (!containerRef.current) return;
		const container = containerRef.current;

		const prefersReduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const header = container.querySelector('[data-entrance="header"]');
		const subtitle = container.querySelector('[data-entrance="subtitle"]');

		if (prefersReduced || waves.length === 0) {
			if (header) gsap.set(header, { opacity: 1, y: 0 });
			if (subtitle) gsap.set(subtitle, { opacity: 1, y: 0 });
			container.style.visibility = "visible";
			return;
		}

		if (header) {
			gsap.fromTo(
				header,
				{ opacity: 0, y: -30 },
				{ opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
			);
		}
		if (subtitle) {
			gsap.fromTo(
				subtitle,
				{ opacity: 0, y: -20 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					delay: 0.2,
					ease: "power2.out",
				}
			);
		}
		// Container is revealed by the first WaveSection via onReady / showContainer
	}, [waves.length]);

	const renderHeader = () => (
		<div className={styles.header}>
			<h1
				data-entrance="header"
				className={`${styles.title} ${titleClasses} ${playfair.className}`}
			>
				{trip.name}
			</h1>
			<p
				data-entrance="subtitle"
				className={`${styles.subtitle} ${bodyClasses} ${crimson.className}`}
			>
				{getCountryNames(trip.countries)}
				{trip.year ? ` • ${trip.year}` : ""}
			</p>
		</div>
	);

	return (
		<div
			ref={containerRef}
			className={styles.layout}
			style={{ visibility: "hidden" }}
		>
			{renderHeader()}
			{waves.map((wave, i) => (
				<WaveSection
					key={i}
					wave={wave}
					waveIndex={i}
					isFirstWave={i === 0}
					animConfig={animConfig}
					crimsonClassName={crimson.className}
					onReady={i === 0 ? showContainer : undefined}
				/>
			))}
		</div>
	);
}
