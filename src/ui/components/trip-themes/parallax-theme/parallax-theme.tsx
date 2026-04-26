"use client";

import { CSSProperties, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { DM_Serif_Display } from "next/font/google";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import { seededRandom } from "@/utils/random";
import { getCountryNames } from "@/utils/country";
import { useVirtualWindow } from "@/hooks/use-virtual-window";
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

const STRIP_COUNT = 7;
const SECTION_PX = 1200;
const SECTION_HOLD_PX = 320;
const SECTION_STRIDE_PX = SECTION_PX + SECTION_HOLD_PX;
const TRANSITION_DELAY_FRAC = 0.18;
const TRANSITION_FRAC = 0.52;
const PHOTO_WINDOW_BEHIND = 1;
const PHOTO_WINDOW_AHEAD = 2;
const PHOTO_MOUNT_BUFFER_BEHIND = 1;
const PHOTO_MOUNT_BUFFER_AHEAD = 2;
const EASES = [
	"power1.out",
	"power2.out",
	"power3.out",
	"sine.out",
	"circ.out",
	"power1.inOut",
	"sine.inOut",
];

interface ParallaxThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

interface StripAnim {
	entryDir: number;
	entryY: number;
	startRatio: number;
	endRatio: number;
	ease: string;
}

function buildStripAnim(photoIdx: number, stripIdx: number): StripAnim {
	const base = photoIdx * 97 + stripIdx * 13;

	const startRatio = seededRandom(base + 2) * 0.42 * TRANSITION_FRAC;
	const endRatio = (0.56 + seededRandom(base + 3) * 0.44) * TRANSITION_FRAC;

	const hasY = seededRandom(base + 5) > 0.4;
	const yMag = 30 + seededRandom(base + 6) * 50;
	const ySign = seededRandom(base + 7) > 0.5 ? 1 : -1;

	return {
		entryDir: seededRandom(base + 1) > 0.5 ? 108 : -108,
		entryY: hasY ? yMag * ySign : 0,
		startRatio,
		endRatio,
		ease: EASES[Math.floor(seededRandom(base + 4) * EASES.length)],
	};
}

export function ParallaxTheme({ trip, config }: ParallaxThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const counterRef = useRef<HTMLSpanElement>(null);
	const scrub = config.animation?.scrollTrigger?.scrub ?? 1.2;
	const photos = trip.photos;
	const count = photos.length;
	const totalScrollHeight = useMemo(
		() => (count - 1) * SECTION_STRIDE_PX,
		[count]
	);

	const { isMounted: isPhotoMounted } = useVirtualWindow({
		count,
		totalScrollHeight,
		containerRef,
		overscanBehind: PHOTO_WINDOW_BEHIND,
		overscanAhead: PHOTO_WINDOW_AHEAD,
		mountBufferBehind: PHOTO_MOUNT_BUFFER_BEHIND,
		mountBufferAhead: PHOTO_MOUNT_BUFFER_AHEAD,
	});

	const allStripAnims = useMemo<StripAnim[][]>(
		() =>
			photos.map((_, p) =>
				Array.from({ length: STRIP_COUNT }, (__, s) =>
					buildStripAnim(p, s)
				)
			),
		[photos]
	);
	useEffect(() => {
		if (!containerRef.current || count === 0) return;

		const container = containerRef.current;
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		const ctx = gsap.context(() => {
			const photoLayers = Array.from(
				container.querySelectorAll<HTMLElement>("[data-photo-layer]")
			);

			if (prefersReduced) {
				photoLayers.forEach((layer) => {
					const photoIndex = Number(layer.dataset.photoIndex ?? "0");
					gsap.set(layer, {
						autoAlpha: photoIndex === 0 ? 1 : 0,
					});
				});
				return;
			}

			if (counterRef.current) {
				counterRef.current.textContent = "01";
				ScrollTrigger.create({
					trigger: container,
					start: "top top",
					end: `top+=${Math.round(Math.max(totalScrollHeight, 1))} top`,
					onUpdate: (self) => {
						const nextIndex = Math.min(
							count - 1,
							Math.max(0, Math.round(self.progress * (count - 1)))
						);
						if (counterRef.current) {
							counterRef.current.textContent = String(
								nextIndex + 1
							).padStart(2, "0");
						}
					},
				});
			}

			photoLayers.forEach((layer) => {
				const photoIndex = Number(layer.dataset.photoIndex ?? "0");
				if (photoIndex !== 0) {
					gsap.set(layer, { autoAlpha: 0 });
					return;
				}

				const strips = Array.from(
					layer.querySelectorAll<HTMLElement>("[data-strip]")
				);
				gsap.set(layer, { autoAlpha: 1 });
				gsap.fromTo(
					strips,
					{
						xPercent: (i) => (i % 2 === 0 ? -108 : 108),
						autoAlpha: 1,
					},
					{
						xPercent: 0,
						autoAlpha: 1,
						duration: 0.65,
						ease: "power3.out",
						stagger: { each: 0.07, from: "center" },
					}
				);
			});

			const titleEl =
				container.querySelector<HTMLElement>("[data-title]");
			const subtitleEl =
				container.querySelector<HTMLElement>("[data-subtitle]");

			if (titleEl) {
				gsap.fromTo(
					titleEl,
					{ autoAlpha: 0, y: 22 },
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.7,
						ease: "power2.out",
						delay: 0.45,
					}
				);
				gsap.to(titleEl, {
					autoAlpha: 0,
					y: -18,
					ease: "power2.in",
					immediateRender: false,
					scrollTrigger: {
						trigger: container,
						start: `top+=${Math.round(SECTION_PX * 0.25)} top`,
						end: `top+=${Math.round(SECTION_PX * 0.6)} top`,
						scrub: 1,
					},
				});
			}

			if (subtitleEl) {
				gsap.fromTo(
					subtitleEl,
					{ autoAlpha: 0 },
					{
						autoAlpha: 1,
						duration: 0.5,
						ease: "power2.out",
						delay: 0.65,
					}
				);
				gsap.to(subtitleEl, {
					autoAlpha: 0,
					ease: "power2.in",
					immediateRender: false,
					scrollTrigger: {
						trigger: container,
						start: `top+=${Math.round(SECTION_PX * 0.15)} top`,
						end: `top+=${Math.round(SECTION_PX * 0.5)} top`,
						scrub: 1,
					},
				});
			}
		}, container);

		return () => ctx.revert();
	}, [count, totalScrollHeight]);

	useEffect(() => {
		if (!containerRef.current || count === 0) return;

		const container = containerRef.current;
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		if (prefersReduced) return;

		const ctx = gsap.context(() => {
			const photoLayers = Array.from(
				container.querySelectorAll<HTMLElement>("[data-photo-layer]")
			);

			photoLayers.forEach((layer) => {
				const photoIndex = Number(layer.dataset.photoIndex ?? "0");
				if (photoIndex === 0) return;

				const strips = Array.from(
					layer.querySelectorAll<HTMLElement>("[data-strip]")
				);
				if (strips.length === 0) return;

				const sectionStart = (photoIndex - 1) * SECTION_STRIDE_PX;
				const layerRevealStart = Math.round(
					sectionStart + TRANSITION_DELAY_FRAC * SECTION_PX
				);

				gsap.set(layer, { autoAlpha: 0 });
				ScrollTrigger.create({
					trigger: container,
					start: `top+=${layerRevealStart} top`,
					onEnter: () => {
						gsap.set(layer, { autoAlpha: 1 });
					},
					onEnterBack: () => {
						gsap.set(layer, { autoAlpha: 1 });
					},
					onLeaveBack: () => {
						gsap.set(layer, { autoAlpha: 0 });
					},
				});

				strips.forEach((strip, s) => {
					const anim = allStripAnims[photoIndex]?.[s];
					if (!anim) return;

					gsap.set(strip, {
						xPercent: anim.entryDir,
						y: anim.entryY,
					});

					gsap.to(strip, {
						xPercent: 0,
						y: 0,
						ease: anim.ease,
						immediateRender: false,
						scrollTrigger: {
							trigger: container,
							start: `top+=${sectionStart + (TRANSITION_DELAY_FRAC + anim.startRatio) * SECTION_PX} top`,
							end: `top+=${sectionStart + (TRANSITION_DELAY_FRAC + anim.endRatio) * SECTION_PX} top`,
							scrub,
						},
					});
				});
			});
		}, container);

		return () => ctx.revert();
	}, [count, scrub, allStripAnims]);

	if (count === 0) return null;

	return (
		<div
			ref={containerRef}
			className={styles.theme}
			style={
				{
					"--total-scroll": `${totalScrollHeight}px`,
				} as CSSProperties
			}
		>
			<div className={styles.scrollContainer}>
				<div className={styles.stickyStage}>
					<div
						className={styles.photosWrapper}
						aria-label="Trip photo gallery"
					>
						{photos.map((photo, p) => (
							<div
								key={`${photo.src}-${p}`}
								className={styles.photoLayer}
								data-photo-layer
								data-photo-index={p}
								style={
									{
										zIndex: p,
										opacity: 0,
										visibility: "hidden",
									} as CSSProperties
								}
							>
								{isPhotoMounted(p) && (
									<Image
										src={photo.src}
										alt={
											photo.title ||
											`${trip.name} — photo ${p + 1}`
										}
										fill
										className={styles.photoImageSingle}
										sizes="(max-width: 768px) 100vw, 68vw"
										priority={p < 2}
										loading={p < 2 ? undefined : "lazy"}
									/>
								)}
								{Array.from(
									{ length: STRIP_COUNT },
									(_, s) => (
										<div
											key={s}
											className={styles.stripPhoto}
											data-strip={s}
											style={
												{
													top: `${(s / STRIP_COUNT) * 100}%`,
													height: `${100 / STRIP_COUNT}%`,
												} as CSSProperties
											}
										>
											<div
												className={styles.stripPhotoImage}
												style={
													{
														top: `${-(s / STRIP_COUNT) * 100}vh`,
														backgroundImage: isPhotoMounted(p)
															? `url(${photo.src})`
															: undefined,
													} as CSSProperties
												}
											/>
										</div>
									)
								)}
							</div>
						))}
					</div>

					<div className={styles.separators} aria-hidden>
						{Array.from({ length: STRIP_COUNT - 1 }, (_, i) => (
							<div
								key={i}
								className={styles.separator}
								style={
									{
										top: `${((i + 1) / STRIP_COUNT) * 100}%`,
									} as CSSProperties
								}
							/>
						))}
					</div>

					<div className={styles.headerOverlay}>
						<p
							className={styles.subtitle}
							data-subtitle
							aria-hidden
						>
							{getCountryNames(trip.countries, " · ")}
							{trip.year ? ` · ${trip.year}` : ""}
						</p>
						<h1
							className={`${styles.title} ${dmSerif.className}`}
							data-title
						>
							{trip.name}
						</h1>
					</div>

					<div className={styles.counter} aria-hidden>
						<span
							ref={counterRef}
							className={styles.counterCurrent}
						>
							01
						</span>
						<span className={styles.counterSep}>/</span>
						<span className={styles.counterTotal}>
							{String(count).padStart(2, "0")}
						</span>
					</div>

					<div className={styles.scrollHint} aria-hidden>
						<span className={styles.scrollLabel}>scroll</span>
						<span className={styles.scrollLine} />
					</div>
				</div>
			</div>
		</div>
	);
}
