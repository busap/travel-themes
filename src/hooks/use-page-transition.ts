'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { getTripRoute } from '@/utils/route';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePageTransition() {
  const router = useRouter();
  const animatingRef = useRef(false);

  const navigateToTrip = useCallback((tripId: string, cardElement: HTMLElement) => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const duration = prefersReducedMotion() ? 0.1 : 0.5;
    const route = getTripRoute(tripId);

    const homeContainer = cardElement.closest('[class*="home"]');
    if (!homeContainer) {
      router.push(route);
      return;
    }

    const otherCards = homeContainer.querySelectorAll('a[href]');
    const fadeTargets: Element[] = [];

      otherCards.forEach((card) => {
      if (card !== cardElement) fadeTargets.push(card);
    });

    if (fadeTargets.length === 0) {
      router.push(route);
      return;
    }

    // Disable CSS transitions so they don't fight GSAP
    fadeTargets.forEach((el) => {
      (el as HTMLElement).style.transition = 'none';
    });
    (cardElement as HTMLElement).style.transition = 'none';

    gsap.to(fadeTargets, {
      opacity: 0,
      y: 20,
      duration,
      ease: 'power2.in',
    });

    gsap.to(cardElement, {
      scale: 1.2,
      duration: duration,
      ease: 'power2.inOut',
      onComplete: () => {
        router.push(route);
        animatingRef.current = false;
      },
    });
  }, [router]);

  return { navigateToTrip };
}
