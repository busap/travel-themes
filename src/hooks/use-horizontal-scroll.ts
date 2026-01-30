import { useEffect, RefObject } from 'react';

export function useHorizontalScroll<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  enabled: boolean = true
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.scrollLeft = 0;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, enabled]);
}
