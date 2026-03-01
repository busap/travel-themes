import { useState, useCallback, useMemo } from 'react';
import { Photo } from '@/types/photo';

interface UseValidatedImagesResult {
  photos: Photo[];
  failedSrcs: Set<string>;
  handleImageError: (src: string) => void;
}

export function useValidatedImages(photos: Photo[]): UseValidatedImagesResult {
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());

  const photosWithSrc = useMemo(() => {
      return photos.filter(photo => photo.src?.trim());
  }, [photos])

  const handleImageError = useCallback((src: string) => {
    setFailedSrcs(prev => {
      if (prev.has(src)) return prev;
      return new Set(prev).add(src);
    });
  }, []);

  return { photos: photosWithSrc, failedSrcs, handleImageError };
}
