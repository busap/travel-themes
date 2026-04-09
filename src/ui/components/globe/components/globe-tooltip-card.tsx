import Image from "next/image";
import { Trip } from "@/types/trip";
import styles from "./globe-tooltip-card.module.scss";

interface GlobeTooltipCardProps {
	trip: Trip;
	countryName: string;
	x: number;
	y: number;
}

export function GlobeTooltipCard({ trip, countryName, x, y }: GlobeTooltipCardProps) {
	return (
		<div className={styles.tooltip} style={{ left: x + 16, top: y - 16 }}>
			<div className={styles.imageWrapper}>
				<Image
					src={trip.coverPhoto}
					alt={trip.name}
					fill
					className={styles.image}
					sizes="240px"
				/>
				<div className={styles.imageOverlay} />
			</div>
			<div className={styles.content}>
				<span className={styles.name}>{trip.name}</span>
				<span className={styles.country}>{countryName}</span>
			</div>
		</div>
	);
}
