import Image from "next/image";
import Link from "next/link";
import { Trip } from "@/types/trip";
import { getTripRoute } from "@/utils/route";
import styles from "./immersive-card.module.scss";

interface ImmersiveCardProps {
	trip: Trip;
	priority: boolean;
}

export function ImmersiveCard({ trip, priority }: ImmersiveCardProps) {
	return (
		<Link href={getTripRoute(trip.id)} className={`group ${styles.card}`}>
			<Image
				src={trip.coverPhoto}
				alt={trip.name}
				fill
				priority={priority}
				className={styles.image}
				sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
			/>

			<div className={styles.primaryGradient} />
			<div className={styles.hoverGradient} />

			<div className={styles.badgeContainer}>
				<div className={styles.countryBadge}>{trip.countries[0]}</div>
			</div>

			<div className={styles.content}>
				{trip.year && (
					<div className={styles.yearBadge}>{trip.year}</div>
				)}
				<h2 className={styles.title}>{trip.name}</h2>
				{trip.description && (
					<p className={styles.description}>{trip.description}</p>
				)}
				<div className={styles.explore}>
					<span className={styles.exploreText}>Explore journey</span>
					<svg
						className={styles.exploreIcon}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</div>
			</div>
		</Link>
	);
}
