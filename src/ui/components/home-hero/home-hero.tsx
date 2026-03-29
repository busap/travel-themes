import styles from "./home-hero.module.scss";

const CLIP_TEXT_IMAGE_URL =
	"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop";

export function HomeHero() {
	return (
		<section className={`${styles.hero} ${styles.heroClipText}`}>
			<div className={styles.content}>
				<h1
					className={styles.titleClipText}
					style={{
						backgroundImage: `url(${CLIP_TEXT_IMAGE_URL})`,
					}}
				>
					TravelThemes
				</h1>
				<p
					className={`${styles.subtitleClipText} ${styles.subtitleAnimated}`}
				>
					Adventures through the lens
				</p>
			</div>
		</section>
	);
}
