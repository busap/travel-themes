"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
	buildPhotosAnimations,
	getLayoutScrollHeight,
	FIRST_CLIP_START,
	CLIP_START,
	CLIP_END,
	MAIN_PHOTO_SECTION_SCROLL_HEIGHT,
	PhotoAnimation,
} from "@/utils/smooth-scroll-layout";
import styles from "./smooth-scroll-theme.module.scss";

const LAYOUT_CLASS_KEYS = [
	"animatedPhotoLayoutOne",
	"animatedPhotoLayoutTwo",
	"animatedPhotoLayoutThree",
	"animatedPhotoLayoutFour",
	"animatedPhotoLayoutFive",
] as const;

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

export function SmoothScrollTheme({ trip, config }: SmoothScrollThemeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const progressFillRef = useRef<HTMLDivElement>(null);
	const preloadedRef = useRef<Set<number>>(new Set());

	const scrub = config.animation?.scrollTrigger?.scrub ?? 1;

	const photoAnimations = useMemo<PhotoAnimation[]>(
		() => buildPhotosAnimations(trip.photos),
		[trip.photos]
	);

	const layoutScrollHeight = useMemo(
		() => getLayoutScrollHeight(photoAnimations),
		[photoAnimations]
	);

	useEffect(() => {
		if (!containerRef.current) return;

		preloadedRef.current = new Set();
		const container = containerRef.current;
		const mainPhotoMask = container.querySelector("[data-main-photo-mask]");
		const mainPhoto = container.querySelector("[data-main-photo]");
		const animatedPhotosMasks = Array.from(
			container.querySelectorAll<HTMLElement>(
				"[data-animated-photo-mask]"
			)
		);
		const animatedPhotos = Array.from(
			container.querySelectorAll<HTMLElement>("[data-animated-photo]")
		);

		if (!mainPhotoMask || !mainPhoto) return;

		const ctx = gsap.context(() => {
			if (progressFillRef.current) {
				gsap.set(progressFillRef.current, {
					scaleY: 0,
					transformOrigin: "top center",
				});
			}

			const totalScrollHeight =
				MAIN_PHOTO_SECTION_SCROLL_HEIGHT + layoutScrollHeight;
			const PRELOAD_LEAD = 0.1;

			ScrollTrigger.create({
				trigger: container,
				start: "top top",
				end: "bottom bottom",
				onUpdate: (self) => {
					if (progressFillRef.current) {
						gsap.set(progressFillRef.current, {
							scaleY: self.progress,
						});
					}

					// Imperatively preload lazy panels (index >= 3) before their reveal
					photoAnimations.forEach((animation, index) => {
						if (index < 3 || preloadedRef.current.has(index))
							return;
						const revealStart =
							MAIN_PHOTO_SECTION_SCROLL_HEIGHT +
							layoutScrollHeight * animation.startRatio;
						const threshold = Math.max(
							0,
							revealStart / totalScrollHeight - PRELOAD_LEAD
						);
						if (self.progress >= threshold) {
							preloadedRef.current.add(index);
							const link = document.createElement("link");
							link.rel = "preload";
							link.as = "image";
							link.href = animation.photo.src;
							document.head.appendChild(link);
						}
					});
				},
			});

			// Initial state
			gsap.set(mainPhotoMask, {
				clipPath: FIRST_CLIP_START,
				autoAlpha: 0,
			});
			gsap.set(mainPhoto, { scale: 1.8 });
			gsap.set(animatedPhotosMasks, {
				autoAlpha: 0,
				clipPath: CLIP_START,
			});
			gsap.set(animatedPhotos, { scale: 1.2 });

			// Main photo reveal
			gsap.timeline()
				.to(mainPhotoMask, {
					autoAlpha: 1,
					duration: 0.5,
					ease: "power2.out",
				})
				.to(
					mainPhoto,
					{ scale: 1.2, duration: 1, ease: "power3.out" },
					0
				);

			// Main photo scroll expand
			const mainPhotoScrollStart = `top top`;
			const mainPhotoScrollEnd = `top+=${MAIN_PHOTO_SECTION_SCROLL_HEIGHT * 0.1} top`;
			gsap.to(mainPhotoMask, {
				clipPath: CLIP_END,
				scrollTrigger: {
					trigger: container,
					start: mainPhotoScrollStart,
					end: mainPhotoScrollEnd,
					scrub,
				},
			});

			gsap.to(mainPhoto, {
				scale: 1,
				immediateRender: false,
				scrollTrigger: {
					trigger: container,
					start: mainPhotoScrollStart,
					end: mainPhotoScrollEnd,
					scrub,
				},
			});

			// Main photo fade out
			gsap.to(mainPhotoMask, {
				autoAlpha: 0,
				ease: "power2.out",
				immediateRender: false,
				scrollTrigger: {
					trigger: container,
					start: `top+=${Math.round(MAIN_PHOTO_SECTION_SCROLL_HEIGHT * 0.9)} top`,
					end: `top+=${Math.round(MAIN_PHOTO_SECTION_SCROLL_HEIGHT)} top`,
					scrub,
				},
			});

			// Animated photos clip-path reveal
			let previousEnd: number | null = null;

			animatedPhotosMasks.forEach((mask, index) => {
				const photo = animatedPhotos[index];
				const animation = photoAnimations[index];
				if (!animation || !photo) return;

				const desiredCurrentStart = Math.round(
					MAIN_PHOTO_SECTION_SCROLL_HEIGHT +
						layoutScrollHeight * animation.startRatio
				);
				const currentStart =
					previousEnd === null ? desiredCurrentStart : previousEnd;
				const currentEnd = currentStart + animation.scrollSpan;
				previousEnd = currentEnd;

				gsap.timeline({
					scrollTrigger: {
						trigger: container,
						start: `top+=${currentStart} top`,
						end: `top+=${currentEnd} top`,
						scrub: scrub + animation.scrubOffset,
					},
				})
					.fromTo(
						mask,
						{
							autoAlpha: 0,
							clipPath: animation.revealFrom,
						},
						{
							autoAlpha: 1,
							clipPath: animation.revealTo,
							duration: animation.entryPortion,
							ease: "none",
						}
					)
					.fromTo(
						photo,
						{
							scale: animation.startScale,
						},
						{
							scale: animation.holdScale,
							duration: animation.entryPortion,
							ease: "none",
						},
						0
					)
					.to(mask, {
						autoAlpha: 1,
						duration: animation.holdPortion,
						ease: "none",
					})
					.to(mask, {
						autoAlpha: 0,
						clipPath: animation.revealFrom,
						duration: animation.exitPortion,
						ease: "none",
					})
					.to(
						photo,
						{
							scale: animation.endScale,
							duration: animation.exitPortion,
							ease: "none",
						},
						"<"
					);
			});
		}, container);

		return () => ctx.revert();
	}, [layoutScrollHeight, photoAnimations, scrub]);

	function renderMainPhotoLayer() {
		return (
			<div className={styles.mainPhotoLayer}>
				<div className={styles.mainPhotoMask} data-main-photo-mask>
					<Image
						src={trip.coverPhoto}
						alt={trip.name}
						className={styles.mainPhoto}
						data-main-photo
						fill
						priority
						sizes="100vw"
					/>
				</div>
			</div>
		);
	}

	function renderAnimatedPhotosLayer() {
		if (photoAnimations.length === 0) return null;
		return (
			<div className={styles.animatedPhotosLayer}>
				{photoAnimations.map((item, index) => (
					<div
						key={`${item.photo.src}-${index}`}
						className={`${styles.animatedPhotoMask} ${styles[LAYOUT_CLASS_KEYS[item.layoutIndex % LAYOUT_CLASS_KEYS.length]]}`}
						data-animated-photo-mask
					>
						<Image
							src={item.photo.src}
							alt={
								item.photo.title ||
								`${trip.name} highlight ${index + 1}`
							}
							className={styles.animatedPhoto}
							data-animated-photo
							fill
							priority={index === 0}
							loading={index >= 3 ? "lazy" : undefined}
							sizes="100vw"
						/>
					</div>
				))}
			</div>
		);
	}

	function renderScrollIndicator() {
		if (photoAnimations.length === 0) return null;
		return (
			<div className={styles.scrollIndicator} aria-hidden="true">
				<div className={styles.scrollTrack}>
					<div ref={progressFillRef} className={styles.scrollFill} />
				</div>
			</div>
		);
	}

	function renderLayout() {
		return (
			<section
				ref={containerRef}
				className={styles.layout}
				style={
					{
						"--layout-scroll-height": `${layoutScrollHeight}px`,
					} as CSSProperties
				}
				aria-label="Trip photos"
			>
				{renderMainPhotoLayer()}
				{renderAnimatedPhotosLayer()}
			</section>
		);
	}

	return (
		<div className={styles.theme}>
			{renderLayout()}
			{renderScrollIndicator()}
		</div>
	);
}
