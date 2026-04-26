"use client";

import { Trip } from "@/types/trip";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { getCountryNames } from "@/utils/country";
import { PolaroidCard } from "@/ui/components/polaroid-card/polaroid-card";
import { ScrollHint } from "@/ui/components/scroll-hint/scroll-hint";
import { getPolaroidTransform } from "@/utils/polaroid-layout";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { useVirtualWindow } from "@/hooks/use-virtual-window";
import styles from "./collage-theme.module.scss";

interface CollageThemeProps {
	trip: Trip;
}

export function CollageTheme({ trip }: CollageThemeProps) {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useHorizontalScroll(scrollContainerRef, true);

	const { focusIndex, isMounted } = useVirtualWindow({
		mode: "dom-visibility",
		count: trip.photos.length,
		containerRef: scrollContainerRef,
		after: 6,
	});

	const spacing = "gap-16";
	const cardsContainerClass = `${styles.cardsContainer} ${spacing}`.trim();

	const getCardWrapperClass = (isVisible: boolean) => {
		return isVisible
			? `${styles.cardWrapper} ${styles.cardWrapperVisible}`
			: `${styles.cardWrapper} ${styles.cardWrapperHidden}`;
	};

	const renderHeader = () => (
		<div className={styles.header}>
			<button
				className={styles.backButton}
				onClick={() => router.back()}
				aria-label="Go back"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M19 12H5" />
					<path d="M12 19l-7-7 7-7" />
				</svg>
			</button>
			<div className={styles.headerInfo}>
				<h1 className={styles.title}>{trip.name}</h1>
				<p className={styles.subtitle}>
					{getCountryNames(trip.countries)}{" "}
					{trip.year && `• ${trip.year}`}
				</p>
			</div>
		</div>
	);

	const renderPolaroidCards = () => {
		return (
			<div className={cardsContainerClass}>
				{trip.photos.map((photo, index) => {
					const { rotation, offset } = getPolaroidTransform(index);
					const mounted = isMounted(index);
					// Look-ahead buffer stays hidden until scroll reaches it
					// so cards still fade in as they enter view.
					const isVisible = mounted && index <= focusIndex;

					return (
						<div
							key={index}
							data-virtual-index={index}
							className={getCardWrapperClass(isVisible)}
						>
							{mounted && (
								<PolaroidCard
									imageSrc={photo.src}
									imageAlt={
										photo.title || `Photo ${index + 1}`
									}
									caption={photo.title}
									rotation={rotation}
									verticalOffset={offset.y}
									aspectRatio="portrait"
								/>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	const renderScrollContainer = () => (
		<div
			ref={scrollContainerRef}
			className={styles.scrollContainer}
			style={{
				scrollbarWidth: "none",
				msOverflowStyle: "none",
			}}
		>
			{renderPolaroidCards()}
		</div>
	);

	const renderScrollHint = () => <ScrollHint />;

	return (
		<div className={styles.theme}>
			{renderHeader()}
			{renderScrollContainer()}
			{renderScrollHint()}
		</div>
	);
}
