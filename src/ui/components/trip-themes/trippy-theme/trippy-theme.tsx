"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Bebas_Neue } from "next/font/google";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCountryNames } from "@/utils/country";
import styles from "./trippy-theme.module.scss";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

const bebas = Bebas_Neue({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});

const PHOTO_SECTION_PX = 1000;
const ENTRY_RATIO = 0.35;
const EXIT_START_RATIO = 0.65;

interface TrippyThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

export function TrippyTheme({ trip, config }: TrippyThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrub = config.animation?.scrollTrigger?.scrub ?? 2;

	const totalScrollHeight = useMemo(
		() => trip.photos.length * PHOTO_SECTION_PX,
		[trip.photos.length]
	);

	useEffect(() => {
		if (!containerRef.current || trip.photos.length === 0) return;
		const container = containerRef.current;

		const layers = Array.from(
			container.querySelectorAll<HTMLElement>("[data-photo-layer]")
		);
		const frames = Array.from(
			container.querySelectorAll<HTMLElement>("[data-photo-frame]")
		);
		const imgs = Array.from(
			container.querySelectorAll<HTMLElement>("[data-photo-img]")
		);

		const HOLD_D = EXIT_START_RATIO - ENTRY_RATIO;
		const EXIT_D = 1 - EXIT_START_RATIO;

		const ctx = gsap.context(() => {
			gsap.set(layers, { autoAlpha: 0 });

			if (layers[0] && frames[0] && imgs[0]) {
				gsap.set(layers[0], { autoAlpha: 1 });
				gsap.set(frames[0], { scale: 1, rotate: 0 });
				gsap.set(imgs[0], { scale: 1.05 });
			}

			layers.forEach((layer, i) => {
				const frame = frames[i];
				const img = imgs[i];
				if (!frame || !img) return;

				const entryRotate = i % 2 === 0 ? 22 : -22;
				const exitRotate = -(entryRotate * 0.6);
				const sectionStart = i * PHOTO_SECTION_PX;
				const sectionEnd = (i + 1) * PHOTO_SECTION_PX;

				const tl = gsap.timeline({
					scrollTrigger: {
						trigger: container,
						start: `top+=${sectionStart} top`,
						end: `top+=${sectionEnd} top`,
						scrub,
					},
				});

				if (i === 0) {
					tl.fromTo(
						layer,
						{ autoAlpha: 1 },
						{ autoAlpha: 0, ease: "none", duration: EXIT_D },
						EXIT_START_RATIO
					)
						.fromTo(
							frame,
							{ scale: 1, rotate: 0 },
							{
								scale: 0.18,
								rotate: exitRotate,
								ease: "power2.in",
								duration: EXIT_D,
							},
							EXIT_START_RATIO
						)
						.fromTo(
							img,
							{ scale: 1.05 },
							{ scale: 1.4, ease: "power2.in", duration: EXIT_D },
							EXIT_START_RATIO
						);
				} else {
					tl.fromTo(
						layer,
						{ autoAlpha: 0 },
						{ autoAlpha: 1, duration: ENTRY_RATIO, ease: "none" }
					)
						.fromTo(
							frame,
							{
								immediateRender: false,
								scale: 2.5,
								rotate: entryRotate,
							},
							{
								scale: 1,
								rotate: 0,
								ease: "power2.out",
								duration: ENTRY_RATIO,
							},
							0
						)
						.fromTo(
							img,
							{ immediateRender: false, scale: 1.4 },
							{
								scale: 1.05,
								ease: "power2.out",
								duration: ENTRY_RATIO,
							},
							0
						)
						.to(layer, {
							autoAlpha: 1,
							duration: HOLD_D,
							ease: "none",
						})
						.to(layer, {
							autoAlpha: 0,
							ease: "none",
							duration: EXIT_D,
						})
						.to(
							frame,
							{
								scale: 0.18,
								rotate: exitRotate,
								ease: "power2.in",
								duration: EXIT_D,
							},
							"<"
						)
						.to(
							img,
							{ scale: 1.4, ease: "power2.in", duration: EXIT_D },
							"<"
						);
				}
			});
		}, container);

		return () => ctx.revert();
	}, [trip.photos, scrub]);

	function renderBackground() {
		return <div data-bg className={styles.bg} aria-hidden />;
	}

	function renderHeader() {
		return (
			<header className={styles.header}>
				<h1 className={`${styles.title} ${bebas.className}`}>
					{trip.name}
				</h1>
				<p className={styles.subtitle}>
					{getCountryNames(trip.countries, " · ")}
					{trip.year ? ` · ${trip.year}` : ""}
				</p>
			</header>
		);
	}

	function renderPhotos() {
		return (
			<div className={styles.photoStack} aria-label="Trip photos">
				{trip.photos.map((photo, i) => (
					<div
						key={`${photo.src}-${i}`}
						className={styles.photoLayer}
						data-photo-layer
					>
						<div className={styles.photoFrame} data-photo-frame>
							<Image
								src={photo.src}
								alt={
									photo.title ||
									`${trip.name} — photo ${i + 1}`
								}
								className={styles.photoImg}
								data-photo-img
								fill
								sizes="(max-width: 768px) 95vw, 88vw"
								priority={i < 2}
								loading={i < 2 ? undefined : "eager"}
							/>
							<div className={styles.photoChroma} aria-hidden />
						</div>

						{photo.title && (
							<p className={styles.photoCaption}>{photo.title}</p>
						)}
					</div>
				))}
			</div>
		);
	}

	function renderScrollHint() {
		return (
			<div className={styles.scrollHint} aria-hidden>
				<span className={styles.scrollLabel}>scroll</span>
				<span className={styles.scrollLine} />
			</div>
		);
	}

	if (trip.photos.length === 0) return null;

	return (
		<div
			ref={containerRef}
			className={styles.theme}
			style={
				{ "--total-scroll": `${totalScrollHeight}px` } as CSSProperties
			}
		>
			{renderBackground()}
			<div className={styles.scrollContainer}>
				<div className={styles.stickyStage}>
					{renderHeader()}
					{renderPhotos()}
					{renderScrollHint()}
				</div>
			</div>
		</div>
	);
}
