"use client";

import {
	AnimationEvent,
	CSSProperties,
	PointerEvent,
	useMemo,
	useRef,
	useState,
} from "react";
import Image from "next/image";
import { Trip } from "@/types/trip";
import { ThemeConfig } from "@/config/theme-config";
import styles from "./drag-shuffle-theme.module.scss";

type SwipeDirection = "left" | "right";

interface DragPoint {
	x: number;
	y: number;
}

interface DragShuffleThemeProps {
	trip: Trip;
	config: ThemeConfig;
}

const SWIPE_THRESHOLD = 120;
const MAX_VISIBLE_CARDS = 3;
const EMPTY_DRAG_POINT: DragPoint = { x: 0, y: 0 };

export function DragShuffleTheme({ trip, config }: DragShuffleThemeProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [dragPoint, setDragPoint] = useState<DragPoint>(EMPTY_DRAG_POINT);
	const [isPointerDragging, setIsPointerDragging] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(
		null
	);
	const pointerStartRef = useRef<DragPoint | null>(null);
	const animationDurationMs = Math.max(
		260,
		Math.round((config.animation?.timeline?.duration ?? 0.45) * 1000)
	);
	const titleClasses = "text-3xl md:text-4xl font-black";
	const bodyClasses = "text-sm md:text-base text-white/70";

	const deckPhotos = useMemo(() => trip.photos.slice(0, 24), [trip.photos]);

	const hasCards = deckPhotos.length > 0;
	const isFirstItem = activeIndex === 0;
	const canRevert = hasCards && !isFirstItem && !isAnimating;
	const visibleCards = useMemo(() => {
		if (!hasCards) return [];

		const cardsToRender = Math.min(MAX_VISIBLE_CARDS, deckPhotos.length);

		return Array.from({ length: cardsToRender }, (_, offset) => {
			const photoIndex = (activeIndex + offset) % deckPhotos.length;
			return deckPhotos[photoIndex];
		});
	}, [activeIndex, deckPhotos, hasCards]);

	const prefersReducedMotion = () => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	};

	const clearGestureState = () => {
		pointerStartRef.current = null;
		setIsPointerDragging(false);
		setIsAnimating(false);
		setSwipeDirection(null);
		setDragPoint(EMPTY_DRAG_POINT);
	};

	const finalizeSwipe = () => {
		setActiveIndex((previous) => {
			if (deckPhotos.length === 0) return 0;
			return (previous + 1) % deckPhotos.length;
		});
		clearGestureState();
	};

	const handleRevert = () => {
		if (!canRevert) return;

		clearGestureState();
		setActiveIndex((previous) => {
			if (deckPhotos.length === 0) return 0;
			return (previous - 1 + deckPhotos.length) % deckPhotos.length;
		});
	};

	const triggerSwipe = (direction: SwipeDirection) => {
		if (!hasCards || isAnimating) return;

		if (prefersReducedMotion()) {
			finalizeSwipe();
			return;
		}

		setDragPoint({
			x: direction === "right" ? SWIPE_THRESHOLD : -SWIPE_THRESHOLD,
			y: 0,
		});
		setSwipeDirection(direction);
		setIsAnimating(true);
		setIsPointerDragging(false);
	};

	const getDragDelta = (event: PointerEvent<HTMLDivElement>): DragPoint => {
		if (!pointerStartRef.current) return EMPTY_DRAG_POINT;

		return {
			x: event.clientX - pointerStartRef.current.x,
			y: event.clientY - pointerStartRef.current.y,
		};
	};

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (!hasCards || isAnimating) return;

		event.currentTarget.setPointerCapture(event.pointerId);
		pointerStartRef.current = { x: event.clientX, y: event.clientY };
		setIsPointerDragging(true);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (!isPointerDragging || isAnimating || !pointerStartRef.current)
			return;
		setDragPoint(getDragDelta(event));
	};

	const handlePointerRelease = (event: PointerEvent<HTMLDivElement>) => {
		if (!pointerStartRef.current) return;

		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		const dragDelta = getDragDelta(event);
		pointerStartRef.current = null;
		setIsPointerDragging(false);

		if (Math.abs(dragDelta.x) < SWIPE_THRESHOLD) {
			setDragPoint(EMPTY_DRAG_POINT);
			return;
		}

		setDragPoint(dragDelta);
		triggerSwipe(dragDelta.x > 0 ? "right" : "left");
	};

	const handleSwipeAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget || !swipeDirection) return;
		finalizeSwipe();
	};

	const renderTripMeta = () => (
		<header className={styles.tripPanel}>
			<p className={styles.eyebrow}>Swipe through this journey</p>
			<h1 className={`${styles.tripName} ${titleClasses}`}>
				{trip.name}
			</h1>
			<p className={`${styles.tripDescription} ${bodyClasses}`}>
				{trip.countries.join(", ")}
				{trip.year ? ` • ${trip.year}` : ""}
			</p>
			{trip.description && (
				<p className={styles.tripSummary}>{trip.description}</p>
			)}
		</header>
	);

	const renderStackCard = (
		photo: (typeof visibleCards)[number],
		stackIndex: number
	) => {
		const isTopCard = stackIndex === 0;

		const cardClassNames = [styles.stackCard];

		if (isTopCard) {
			cardClassNames.push(styles.topCard);

			if (swipeDirection === "left") {
				cardClassNames.push(styles.swipingLeft);
			}

			if (swipeDirection === "right") {
				cardClassNames.push(styles.swipingRight);
			}
		} else {
			cardClassNames.push(styles.backgroundCard);
		}

		const cardStyle: CSSProperties = {
			zIndex: MAX_VISIBLE_CARDS - stackIndex,
		};

		if (isTopCard && !swipeDirection) {
			cardStyle.transform = `translate3d(${dragPoint.x}px, ${dragPoint.y * 0.24}px, 0) rotate(${dragPoint.x * 0.05}deg)`;
			cardStyle.transition = isPointerDragging
				? "none"
				: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";
		}

		const placeName =
			photo.title?.trim() ||
			`${trip.countries[0]} stop ${activeIndex + stackIndex + 1}`;

		return (
			<article
				key={`${photo.src}-${activeIndex + stackIndex}`}
				className={cardClassNames.join(" ")}
				data-stack-index={stackIndex}
				style={cardStyle}
				onPointerDown={isTopCard ? handlePointerDown : undefined}
				onPointerMove={isTopCard ? handlePointerMove : undefined}
				onPointerUp={isTopCard ? handlePointerRelease : undefined}
				onPointerCancel={
					isTopCard ? () => clearGestureState() : undefined
				}
				onAnimationEnd={isTopCard ? handleSwipeAnimationEnd : undefined}
			>
				<Image
					src={photo.src}
					alt={placeName}
					fill
					priority={isTopCard}
					className={styles.cardImage}
					sizes="(max-width: 768px) 78vw, 420px"
				/>
				<div className={styles.imageShade} />
				<footer className={styles.cardFooter}>
					<p className={styles.placeName}>{placeName}</p>
				</footer>
			</article>
		);
	};

	return (
		<section
			className={styles.theme}
			style={
				{
					"--swipe-duration": `${animationDurationMs}ms`,
				} as CSSProperties
			}
		>
			<div className={styles.layout}>
				{renderTripMeta()}
				<div className={styles.deckPanel}>
					<div
						className={`${styles.deck} ${
							swipeDirection === "left"
								? styles.deckLeft
								: swipeDirection === "right"
									? styles.deckRight
									: ""
						}`}
					>
						{hasCards ? (
							visibleCards.map((photo, index) =>
								renderStackCard(photo, index)
							)
						) : (
							<div className={styles.emptyState}>
								No photos available
							</div>
						)}
					</div>

					{hasCards && (
						<div className={styles.progressRow}>
							<button
								type="button"
								className={styles.revertButton}
								onClick={handleRevert}
								disabled={!canRevert}
								style={
									isFirstItem
										? { visibility: "hidden" }
										: undefined
								}
								aria-label="Go back one image"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									className={styles.revertIcon}
									aria-hidden="true"
								>
									<path
										d="M10 7L5 12L10 17"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M5 12H15C18.314 12 21 14.686 21 18"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
							<p className={styles.progress}>
								{(activeIndex % deckPhotos.length) + 1} /{" "}
								{deckPhotos.length}
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
