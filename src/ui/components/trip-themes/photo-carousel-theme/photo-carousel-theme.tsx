"use client";

import { useRef, useMemo, useEffect, CSSProperties, PointerEvent } from "react";
import Image from "next/image";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import styles from "./photo-carousel-theme.module.scss";
import { Photo } from "@/types/photo";

interface PhotoCarouselThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

interface RowState {
	position: number;
	isDragging: boolean;
	dragStartX: number;
	dragStartPos: number;
	velocity: number;
	lastX: number;
	lastTime: number;
}

// Speed ratios per row (sign = direction, magnitude = relative speed)
const ROW_SPEED_RATIOS = [-1.3, 1.0, -1.5] as const;

function makeRowState(): RowState {
	return {
		position: 0,
		isDragging: false,
		dragStartX: 0,
		dragStartPos: 0,
		velocity: 0,
		lastX: 0,
		lastTime: 0,
	};
}

function clamp(position: number, halfWidth: number): number {
	let pos = position;
	if (halfWidth <= 0) return pos;
	// Keep position in [-halfWidth, 0]
	pos = pos % halfWidth;
	if (pos > 0) pos -= halfWidth;
	if (pos < -halfWidth) pos += halfWidth;
	return pos;
}

export function PhotoCarouselTheme({ trip, config }: PhotoCarouselThemeProps) {
	const titleClasses = "text-5xl font-bold tracking-tight";
	const bodyClasses = "text-base text-white/60";
	const baseSpeed = config.animation.timeline?.duration ?? 1.0;
	// Split photos across 3 rows; fall back to all photos if a row would be empty
	const rows = useMemo(() => {
		const photos = trip.photos;
		if (photos.length === 0) return [[], [], []] as (typeof photos)[];

		const rowData: (typeof photos)[] = [[], [], []];
		photos.forEach((photo, i) => rowData[i % 3].push(photo));

		return rowData.map((row) => (row.length > 0 ? row : photos));
	}, [trip.photos]);

	const trackRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
	const wrapperRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

	const rowStates = useRef<RowState[]>([
		makeRowState(),
		makeRowState(),
		makeRowState(),
	]);

	const rafRef = useRef<number>(0);

	useEffect(() => {
		const speeds = ROW_SPEED_RATIOS.map((r) => r * baseSpeed);

		// Initialize right-scroll rows so they start mid-track for seamless entry
		rowStates.current.forEach((state, i) => {
			if (speeds[i] > 0) {
				const el = trackRefs.current[i];
				if (el) {
					const halfWidth = el.scrollWidth / 2;
					state.position = -halfWidth;
				}
			}
		});

		const tick = () => {
			rowStates.current.forEach((state, i) => {
				const el = trackRefs.current[i];
				if (!el) return;

				const halfWidth = el.scrollWidth / 2;
				if (halfWidth <= 0) return;

				if (!state.isDragging) {
					// Apply momentum from drag release
					if (Math.abs(state.velocity) > 0.08) {
						state.position += state.velocity;
						state.velocity *= 0.93;
					} else {
						state.velocity = 0;
						state.position += speeds[i];
					}
				}

				state.position = clamp(state.position, halfWidth);
				el.style.transform = `translateX(${state.position}px)`;
			});

			rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [baseSpeed]);

	const getPointerHandlers = (rowIndex: number) => ({
		onPointerDown(e: PointerEvent<HTMLDivElement>) {
			e.currentTarget.setPointerCapture(e.pointerId);
			const state = rowStates.current[rowIndex];
			state.isDragging = true;
			state.dragStartX = e.clientX;
			state.dragStartPos = state.position;
			state.lastX = e.clientX;
			state.lastTime = performance.now();
			state.velocity = 0;
		},
		onPointerMove(e: PointerEvent<HTMLDivElement>) {
			const state = rowStates.current[rowIndex];
			if (!state.isDragging) return;

			const now = performance.now();
			const dt = now - state.lastTime;
			if (dt > 0) {
				// Normalize velocity to ~60fps frame units
				state.velocity = ((e.clientX - state.lastX) / dt) * 16;
			}
			state.lastX = e.clientX;
			state.lastTime = now;

			const dx = e.clientX - state.dragStartX;
			const el = trackRefs.current[rowIndex];
			if (!el) return;

			const halfWidth = el.scrollWidth / 2;
			state.position = clamp(state.dragStartPos + dx, halfWidth);
			el.style.transform = `translateX(${state.position}px)`;
		},
		onPointerUp(e: PointerEvent<HTMLDivElement>) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget.releasePointerCapture(e.pointerId);
			}
			rowStates.current[rowIndex].isDragging = false;
		},
		onPointerCancel() {
			rowStates.current[rowIndex].isDragging = false;
			rowStates.current[rowIndex].velocity = 0;
		},
	});

	const renderRow = (rowPhotos: Photo[], rowIndex: number) => {
		// Duplicate the photos so the track is seamlessly loopable
		const items = [...rowPhotos, ...rowPhotos];

		return (
			<div
				key={rowIndex}
				ref={(el) => {
					wrapperRefs.current[rowIndex] = el;
				}}
				className={styles.rowWrapper}
				{...getPointerHandlers(rowIndex)}
			>
				<div
					ref={(el) => {
						trackRefs.current[rowIndex] = el;
					}}
					className={styles.rowTrack}
				>
					{items.map((photo, i) => (
						<div
							key={`${photo.src}-${rowIndex}-${i}`}
							className={styles.imageCard}
						>
							<Image
								src={photo.src}
								alt={photo.title || `Photo ${i + 1}`}
								fill
								draggable={false}
								className={styles.image}
								sizes="(max-width: 768px) 180px, 280px"
							/>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<section
			className={styles.theme}
			style={{ "--rows": 3 } as CSSProperties}
		>
			<div className={styles.carouselGrid}>
				{rows.map((rowPhotos, i) => renderRow(rowPhotos, i))}
			</div>

			{/* Dark gradient overlays on left/right edges for depth */}
			<div className={styles.edgeFadeLeft} aria-hidden="true" />
			<div className={styles.edgeFadeRight} aria-hidden="true" />

			{/* Centered overlay with trip info */}
			<div className={styles.overlay}>
				<div className={styles.pill}>Journey</div>
				<h1 className={`${styles.title} ${titleClasses}`}>
					{trip.name}
				</h1>
				<p className={`${styles.subtitle} ${bodyClasses}`}>
					{trip.countries.join(" · ")}
					{trip.year ? ` · ${trip.year}` : ""}
				</p>
			</div>
		</section>
	);
}
