import { HomeHero } from "@/ui/components/home-hero/home-hero";
import { Trip } from "@/types/trip";
import styles from "./home.module.scss";

export function Home({ trips }: { trips: Trip[] }) {
	return (
		<div className={styles.home}>
			<HomeHero trips={trips} />
		</div>
	);
}
