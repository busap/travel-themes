import { useEffect, RefObject } from 'react';

export function useHorizontalScroll(
  containerRef: RefObject<HTMLElement>,
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
