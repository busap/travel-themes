import Image from "next/image";
import Link from "next/link";
import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import styles from "./globe-tooltip-card.module.scss";

interface GlobeTooltipCardProps {
	trip: Trip;
	countryName: string;
	x: number;
	y: number;
	mobile?: boolean;
}

export function GlobeTooltipCard({
	trip,
	countryName,
	x,
	y,
	mobile = false,
}: GlobeTooltipCardProps) {
	const inner = (
		<>
			<div className={styles.imageWrapper}>
				<Image
					src={trip.coverPhoto}
					alt={trip.name}
					fill
					className={styles.image}
					sizes="320px"
				/>
				<div className={styles.imageOverlay} />
			</div>
			<div className={styles.content}>
				<span className={styles.name}>{trip.name}</span>
				<span className={styles.country}>{countryName}</span>
				{mobile && (
					<span className={styles.tapHint}>Tap to explore →</span>
				)}
			</div>
		</>
	);

	if (mobile) {
		return (
			<Link href={getTripRoute(trip.id)} className={styles.tooltipMobile}>
				{inner}
			</Link>
		);
	}

	return (
		<div className={styles.tooltip} style={{ left: x + 16, top: y - 16 }}>
			{inner}
		</div>
	);
}
