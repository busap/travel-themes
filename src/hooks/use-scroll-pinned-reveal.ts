import { useEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface UseScrollPinnedRevealOptions {
	containerRef: RefObject<HTMLElement | null>;
	enabled?: boolean;
	itemCount?: number;
	pinDuration?: string;
	config?: {
		scrub?: boolean | number;
		ease?: string;
	};
}

export function useScrollPinnedReveal({
	containerRef,
	enabled = true,
	itemCount,
	pinDuration = "+=200%",
	config = {},
}: UseScrollPinnedRevealOptions) {
	useEffect(() => {
		if (!enabled || !containerRef.current) return;

		gsap.registerPlugin(ScrollTrigger);

		const container = containerRef.current;
		const sections = container.querySelectorAll("[data-photo-index]");

		if (sections.length === 0) return;

		const triggers: ScrollTrigger[] = [];

		sections.forEach((section, index) => {
			gsap.set(section, {
				opacity: 0,
				scale: 0.95,
			});

			const trigger = ScrollTrigger.create({
				trigger: section,
				start: "top top",
				end: pinDuration,
				scrub: config.scrub ?? 2,
				pin: true,
				pinSpacing: true,
				anticipatePin: 1,
				onEnter: () => {
					gsap.to(section, {
						opacity: 1,
						scale: 1,
						duration: 0.8,
						ease: "power2.out",
						overwrite: true,
					});
				},
				onLeave: () => {
					gsap.to(section, {
						opacity: 0,
						scale: 0.95,
						duration: 1,
						ease: "power2.inOut",
						overwrite: true,
					});
				},
				onEnterBack: () => {
					gsap.to(section, {
						opacity: 1,
						scale: 1,
						duration: 0.8,
						ease: "power2.out",
						overwrite: true,
					});
				},
				onLeaveBack: () => {
					gsap.to(section, {
						opacity: 0,
						scale: 0.95,
						duration: 1,
						ease: "power2.inOut",
						overwrite: true,
					});
				},
			});

			triggers.push(trigger);
		});

		return () => {
			triggers.forEach((trigger) => trigger?.kill());
		};
	}, [containerRef, enabled, itemCount, pinDuration, config]);
}
