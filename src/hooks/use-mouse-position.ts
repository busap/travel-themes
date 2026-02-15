import { useState, useEffect, RefObject } from 'react';

interface MousePosition {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

/**
 * Tracks mouse position relative to an element as percentages.
 * Useful for creating cursor-following effects like gloss reflections.
 *
 * @param elementRef - Reference to the element to track mouse position within
 * @returns Mouse position as percentages {x: 0-100, y: 0-100}
 */
export function useMousePosition(elementRef: RefObject<HTMLElement | null>): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 50, y: 50 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp values to 0-100 range
      setPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, [elementRef]);

  return position;
}
