import { useEffect, RefObject } from "react";
import gsap from "gsap";

interface UseAuroraAnimationOptions {
	enabled?: boolean;
	duration?: number;
}

export function useAuroraAnimation(
	svgRef: RefObject<SVGSVGElement | null>,
	options: UseAuroraAnimationOptions = {}
) {
	const { enabled = true, duration = 20 } = options;

	useEffect(() => {
		if (!enabled || !svgRef.current) return;

		const svg = svgRef.current;
		const layers = svg.querySelectorAll("[data-aurora-layer]");

		if (layers.length === 0) return;

		const timelines: gsap.core.Timeline[] = [];

		// Animate each layer with subtle, flowing movements
		layers.forEach((layer, index) => {
			const tl = gsap.timeline({
				repeat: -1,
				yoyo: true,
			});

			const movements = [
				{ x: 60, y: -25, scale: 1.1 },
				{ x: -50, y: 30, scale: 1.08 },
				{ x: 70, y: -15, scale: 1.12 },
				{ x: -60, y: 20, scale: 1.09 },
			];

			const movement = movements[index % movements.length];
			const layerDuration = duration + index * 2;

			tl.to(layer, {
				x: movement.x,
				y: movement.y,
				scale: movement.scale,
				duration: layerDuration,
				ease: "sine.inOut",
			});

			timelines.push(tl);
		});

		return () => {
			timelines.forEach((tl) => tl.kill());
		};
	}, [svgRef, enabled, duration]);
}
