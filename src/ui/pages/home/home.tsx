"use client";

import React from "react";
import { TripCard } from "@/ui/components/trip-card/trip-card";
import { HomeHero } from "@/ui/components/home-hero/home-hero";
import { TripCardVariant } from "@/enums/trip-card-variant";
import { getAllTrips } from "@/utils/trip";
import { getPolaroidTransform } from "@/utils/polaroid-layout";
import { usePageTransition } from "@/hooks/use-page-transition";
import styles from "./home.module.scss";

export function Home() {
	const trips = getAllTrips();
	const { navigateToTrip } = usePageTransition();

	const handleCardClick =
		(tripId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			navigateToTrip(tripId, e.currentTarget);
		};

	return (
		<div className={styles.home}>
			<HomeHero />

			<main className={styles.main}>
				<div className={styles.grid}>
					{trips.map((trip, index) => {
						const { rotation, scale, offset } =
							getPolaroidTransform(index);

						return (
							<TripCard
								key={trip.id}
								trip={trip}
								variant={TripCardVariant.Polaroid}
								rotation={rotation}
								scale={scale}
								offset={offset}
								priority={index < 3}
								onClick={handleCardClick(trip.id)}
							/>
						);
					})}
				</div>
			</main>
		</div>
	);
}
