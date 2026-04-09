import { Trip } from "@/types/trip";
import { TripCard } from "@/ui/components/trip-card/trip-card";
import styles from "./trip-strip.module.scss";

interface TripStripProps {
	trips: Trip[];
	onTripHover?: (tripId: string | null) => void;
}

export function TripStrip({ trips, onTripHover }: TripStripProps) {
	return (
		<aside className={styles.strip}>
			<div className={styles.list}>
				{trips.map((trip, i) => (
					<div key={trip.id} className={styles.cardWrapper}>
						<TripCard
							trip={trip}
							priority={i < 3}
							compact
							onTripHover={onTripHover}
							onTripHoverEnd={
								onTripHover
									? () => onTripHover(null)
									: undefined
							}
						/>
					</div>
				))}
			</div>
		</aside>
	);
}
