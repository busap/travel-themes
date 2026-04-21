import { useEffect, useState, RefObject } from "react";

interface Options {
	rootMargin?: string;
	threshold?: number | number[];
}

export function useIntersectionObserver(
	ref: RefObject<Element | null>,
	options: Options = {}
): boolean {
	const [hasIntersected, setHasIntersected] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element || hasIntersected) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setHasIntersected(true);
					observer.disconnect();
				}
			},
			{ rootMargin: options.rootMargin, threshold: options.threshold }
		);

		observer.observe(element);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref, options.rootMargin, options.threshold, hasIntersected]);

	return hasIntersected;
}
