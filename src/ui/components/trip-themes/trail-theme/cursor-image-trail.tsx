'use client';

import { useEffect, useRef } from 'react';
import styles from './cursor-image-trail.module.scss';

interface CursorImageTrailProps {
  images: string[];
  spawnThreshold?: number;
  smoothing?: number;
  lifespan?: number;
  maxItems?: number;
}

interface Point {
  x: number;
  y: number;
}

export function CursorImageTrail({
  images,
  spawnThreshold = 80,
  smoothing = 0.13,
  lifespan = 2400,
  maxItems = 20,
}: CursorImageTrailProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const interpRef = useRef<Point>({ x: 0, y: 0 });
  const lastSpawnRef = useRef<Point>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const imageIndexRef = useRef(0);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    mountedRef.current = true;

    const container = containerRef.current;

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      mouseRef.current = { x: clientX, y: clientY };
      if (!interpRef.current.x && !interpRef.current.y) {
        interpRef.current = { x: clientX, y: clientY };
        lastSpawnRef.current = { x: clientX, y: clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const distance = (a: Point, b: Point) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.hypot(dx, dy);
    };

    const spawnItem = () => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const current = interpRef.current;

      const xInContainer = current.x - rect.left;
      const yInContainer = current.y - rect.top;

      const el = document.createElement('div');
      el.className = styles.item;

      const src = images[imageIndexRef.current % images.length];
      imageIndexRef.current += 1;
      el.style.backgroundImage = `url(${src})`;

      const randomness = (min: number, max: number) =>
        min + Math.random() * (max - min);

      const baseLeft = xInContainer - el.offsetWidth / 2 || xInContainer - 110;
      const baseTop = yInContainer - el.offsetHeight / 2 || yInContainer - 75;

      const dirX = mouseRef.current.x - interpRef.current.x;
      const dirY = mouseRef.current.y - interpRef.current.y;
      const len = Math.hypot(dirX, dirY) || 1;
      const normX = dirX / len;
      const normY = dirY / len;

      const slideDistance = randomness(24, 60);

      el.style.left = `${baseLeft}px`;
      el.style.top = `${baseTop}px`;
      const rotation = randomness(-12, 12);
      el.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg)`;

      container.appendChild(el);
      itemsRef.current.push(el);

      if (itemsRef.current.length > maxItems) {
        const first = itemsRef.current.shift();
        if (first && first.parentElement === container) {
          container.removeChild(first);
        }
      }

      requestAnimationFrame(() => {
        const targetLeft = baseLeft + normX * slideDistance;
        const targetTop = baseTop + normY * slideDistance;
        el.style.left = `${targetLeft}px`;
        el.style.top = `${targetTop}px`;
        el.style.opacity = '1';
      });

      window.setTimeout(() => {
        el.style.opacity = '0';
        window.setTimeout(() => {
          if (el.parentElement === container) {
            container.removeChild(el);
          }
        }, 700);
      }, lifespan);
    };

    const tick = () => {
      const target = mouseRef.current;
      const current = interpRef.current;

      interpRef.current = {
        x: current.x + (target.x - current.x) * smoothing,
        y: current.y + (target.y - current.y) * smoothing,
      };

      if (distance(interpRef.current, lastSpawnRef.current) > spawnThreshold) {
        lastSpawnRef.current = { ...interpRef.current };
        spawnItem();
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      itemsRef.current.forEach((el) => {
        if (el.parentElement === container) container.removeChild(el);
      });
      itemsRef.current = [];
    };
  }, [images, spawnThreshold, smoothing, lifespan, maxItems]);

  if (!mountedRef.current && typeof window !== 'undefined') {
    const hasPointer = window.matchMedia('(hover: hover)').matches;
    if (!hasPointer) {
      return null;
    }
  }

  return <div ref={containerRef} className={styles.container} />;
}

