import { useEffect, useState, RefObject } from 'react';

interface UseScrollBasedRevealOptions {
  containerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  totalItems: number;
  itemCount?: number;
}

export function useScrollBasedReveal({
  containerRef,
  enabled,
  totalItems,
  itemCount,
}: UseScrollBasedRevealOptions): Set<number> {
  const getInitialVisibleItems = () => {
    if (enabled) {
      return new Set<number>();
    }
    const count = itemCount ?? totalItems;
    return new Set(Array.from({ length: count }, (_, i) => i));
  };

  const [visibleItems, setVisibleItems] = useState<Set<number>>(getInitialVisibleItems);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !enabled) {
      return;
    }

    const handleScroll = () => {
      const items = container.querySelectorAll('[data-photo-index]');

      setVisibleItems((prev) => {
        const newVisible = new Set(prev);

        items.forEach((item) => {
          const index = parseInt(item.getAttribute('data-photo-index') || '0');
          const rect = item.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          if (rect.left < containerRect.right && rect.right > containerRect.left) {
            newVisible.add(index);
          }
        });

        return newVisible;
      });
    };

    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, enabled]);

  return visibleItems;
}
