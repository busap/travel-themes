import { forwardRef, useMemo } from "react";
import { seededRandom } from "@/utils/random";
import styles from "./aurora-background.module.scss";

export const AuroraBackground = forwardRef<SVGSVGElement>((props, ref) => {
	const stars = useMemo(
		() =>
			Array.from({ length: 150 }, (_, i) => ({
				x: Math.round(seededRandom(i * 1.1) * 1920 * 100) / 100,
				y: Math.round(seededRandom(i * 2.3) * 800 * 100) / 100,
				size: Math.round((seededRandom(i * 3.7) * 2 + 0.5) * 100) / 100,
				opacity:
					Math.round((seededRandom(i * 4.9) * 0.8 + 0.2) * 100) / 100,
				duration: Math.round((3 + seededRandom(i * 5.1) * 4) * 10) / 10,
			})),
		[]
	);

	const renderGradients = () => (
		<>
			{/* Enhanced radial gradients for aurora layers */}
			<radialGradient id="aurora-glow-emerald" cx="50%" cy="50%" r="60%">
				<stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
				<stop offset="30%" stopColor="#34d399" stopOpacity="0.6" />
				<stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
				<stop offset="100%" stopColor="#047857" stopOpacity="0" />
			</radialGradient>

			<radialGradient id="aurora-glow-violet" cx="50%" cy="50%" r="60%">
				<stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.9" />
				<stop offset="30%" stopColor="#a78bfa" stopOpacity="0.6" />
				<stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.3" />
				<stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
			</radialGradient>

			<radialGradient id="aurora-glow-cyan" cx="50%" cy="50%" r="60%">
				<stop offset="0%" stopColor="#67e8f9" stopOpacity="0.7" />
				<stop offset="30%" stopColor="#22d3ee" stopOpacity="0.5" />
				<stop offset="70%" stopColor="#06b6d4" stopOpacity="0.2" />
				<stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
			</radialGradient>

			<radialGradient id="aurora-glow-rose" cx="50%" cy="50%" r="60%">
				<stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
				<stop offset="30%" stopColor="#fb7185" stopOpacity="0.4" />
				<stop offset="70%" stopColor="#f43f5e" stopOpacity="0.2" />
				<stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
			</radialGradient>
		</>
	);

	const renderFilters = () => (
		<>
			{/* Blur filter for aurora glow */}
			<filter id="aurora-blur">
				<feGaussianBlur in="SourceGraphic" stdDeviation="50" />
			</filter>
		</>
	);

	const renderStars = () => (
		<g className={styles.stars}>
			{stars.map((star, i) => (
				<circle
					key={i}
					cx={star.x}
					cy={star.y}
					r={star.size}
					fill="white"
					opacity={star.opacity}
				>
					<animate
						attributeName="opacity"
						values={`${star.opacity};${star.opacity * 0.3};${star.opacity}`}
						dur={`${star.duration}s`}
						repeatCount="indefinite"
					/>
				</circle>
			))}
		</g>
	);

	const renderAuroraLayer = (
		id: number,
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		gradient: string
	) => (
		<g
			className={styles[`layer${id}` as keyof typeof styles]}
			data-aurora-layer={id}
			filter="url(#aurora-blur)"
		>
			<ellipse
				cx={cx}
				cy={cy}
				rx={rx}
				ry={ry}
				fill={`url(#${gradient})`}
			/>
		</g>
	);

	return (
		<svg
			ref={ref}
			className={styles.background}
			viewBox="0 0 1920 1080"
			preserveAspectRatio="xMidYMid slice"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				{renderGradients()}
				{renderFilters()}
			</defs>

			{renderStars()}

			{/* Organic aurora curtains - flowing light bands */}
			{renderAuroraLayer(1, 400, 250, 450, 600, "aurora-glow-emerald")}
			{renderAuroraLayer(2, 960, 200, 500, 650, "aurora-glow-violet")}
			{renderAuroraLayer(3, 1500, 280, 480, 620, "aurora-glow-cyan")}
			{renderAuroraLayer(4, 700, 350, 380, 480, "aurora-glow-rose")}
		</svg>
	);
});

AuroraBackground.displayName = "AuroraBackground";
