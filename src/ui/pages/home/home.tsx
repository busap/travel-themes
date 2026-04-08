import { HomeHero } from "@/ui/components/home-hero/home-hero";
import styles from "./home.module.scss";

export function Home() {
	return (
		<div className={styles.home}>
			<HomeHero />
		</div>
	);
}
