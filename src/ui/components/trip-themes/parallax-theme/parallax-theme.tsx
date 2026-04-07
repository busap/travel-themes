"use client";

import { CSSProperties, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { DM_Serif_Display } from "next/font/google";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./parallax-theme.module.scss";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

const dmSerif = DM_Serif_Display({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	display: "swap",
});

const MAX_Y_PX = 110;
const MAX_X_PC = 7;
const SCROLL_HEIGHT_BASE = 2400;
const MIN_STRIPS = 6;
const MAX_STRIPS = 8;

interface ParallaxThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

/** Maps strip index to a -1…+1 factor: top strip = -1, bottom = +1, centre ≈ 0. */
function yFactor(index: number, count: number): number {
	if (count <= 1) return 0;
	return (index / (count - 1) - 0.5) * 2;
}

/** Alternates horizontal drift direction per strip. */
function xDir(index: number): 1 | -1 {
	return index % 2 === 0 ? 1 : -1;
}

export function ParallaxTheme({ trip, config }: ParallaxThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrub = config.animation?.scrollTrigger?.scrub ?? 1.5;

	const photos = useMemo(() => {
		const raw = trip.photos.slice(0, MAX_STRIPS);
		if (raw.length === 0) return [];
		// Always fill at least MIN_STRIPS strips by cycling available photos.
		// With few photos this creates a dramatic multi-depth parallax; with
		// many photos each strip shows a unique image.
		const target = Math.max(raw.length, MIN_STRIPS);
		return Array.from({ length: target }, (_, i) => raw[i % raw.length]);
	}, [trip.photos]);
	const count = photos.length;

	const scrollHeight = useMemo(
		() => SCROLL_HEIGHT_BASE + count * 80,
		[count]
	);

	useEffect(() => {
		if (!containerRef.current || count === 0) return;

		const container = containerRef.current;
		const strips = Array.from(
			container.querySelectorAll<HTMLElement>("[data-strip]")
		);
		const titleEl = container.querySelector<HTMLElement>("[data-title]");
		const subtitleEl =
			container.querySelector<HTMLElement>("[data-subtitle]");

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		const ctx = gsap.context(() => {
			if (prefersReduced) {
				gsap.set([...strips, titleEl, subtitleEl].filter(Boolean), {
					autoAlpha: 1,
					clearProps: "transform",
				});
				return;
			}

			// ── Entrance: strips fly in from alternating sides, staggered from centre ──
			gsap.set(strips, {
				xPercent: (i) => (xDir(i) * 108) as number,
				autoAlpha: 0,
			});
			gsap.set([titleEl, subtitleEl].filter(Boolean), { autoAlpha: 0 });

			const entranceTl = gsap.timeline({
				defaults: { ease: "power3.out" },
			});
			entranceTl
				.to(strips, {
					xPercent: 0,
					autoAlpha: 1,
					duration: 0.75,
					stagger: { each: 0.09, from: "center" },
				})
				.fromTo(
					subtitleEl,
					{ autoAlpha: 0, y: 8 },
					{ autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
					0.45
				)
				.fromTo(
					titleEl,
					{ autoAlpha: 0, y: 20 },
					{ autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
					0.35
				);

			// ── Scroll parallax: strips diverge vertically + drift horizontally ──
			const scrollTriggerConfig = {
				trigger: container,
				start: "top top",
				end: "bottom bottom",
				scrub,
			};

			strips.forEach((strip, i) => {
				gsap.fromTo(
					strip,
					{ y: 0, xPercent: 0 },
					{
						y: MAX_Y_PX * yFactor(i, strips.length),
						xPercent: MAX_X_PC * xDir(i),
						ease: "none",
						immediateRender: false,
						scrollTrigger: scrollTriggerConfig,
					}
				);
			});

			// ── Header fades out near end of scroll ──
			if (titleEl) {
				gsap.to(titleEl, {
					autoAlpha: 0,
					y: -25,
					ease: "power2.in",
					scrollTrigger: {
						trigger: container,
						start: "75% top",
						end: "92% top",
						scrub: 1,
					},
				});
			}
			if (subtitleEl) {
				gsap.to(subtitleEl, {
					autoAlpha: 0,
					ease: "power2.in",
					scrollTrigger: {
						trigger: container,
						start: "70% top",
						end: "87% top",
						scrub: 1,
					},
				});
			}
		}, container);

		return () => ctx.revert();
	}, [count, scrub]);

	if (count === 0) return null;

	return (
		<div
			ref={containerRef}
			className={styles.theme}
			style={
				{
					"--scroll-height": `${scrollHeight}px`,
					"--count": count,
				} as CSSProperties
			}
		>
			<div className={styles.scrollContainer}>
				<div className={styles.stickyStage}>
					{/* Photo strips */}
					<div
						className={styles.stripsContainer}
						aria-label="Trip photos"
					>
						{photos.map((photo, i) => (
							<div
								key={`${photo.src}-${i}`}
								className={styles.strip}
								data-strip
							>
								<div className={styles.imageWrapper}>
									<Image
										src={photo.src}
										alt={
											photo.title ||
											`${trip.name} — photo ${i + 1}`
										}
										className={styles.image}
										fill
										sizes="100vw"
										priority={i < 3}
									/>
								</div>
								<div className={styles.stripTint} aria-hidden />
								{photo.title && (
									<span className={styles.caption}>
										{photo.title}
									</span>
								)}
							</div>
						))}
					</div>

					{/* Title overlay */}
					<div
						className={styles.headerOverlay}
						aria-label={`${trip.name} trip overview`}
					>
						<p className={styles.subtitle} data-subtitle>
							{trip.countries.join(" · ")}
							{trip.year ? ` · ${trip.year}` : ""}
						</p>
						<h1
							className={`${styles.title} ${dmSerif.className}`}
							data-title
						>
							{trip.name}
						</h1>
					</div>

					{/* Scroll hint */}
					<div className={styles.scrollHint} aria-hidden>
						<span className={styles.scrollLabel}>scroll</span>
						<span className={styles.scrollLine} />
					</div>
				</div>
			</div>
		</div>
	);
}
