import { useState, useCallback } from 'react';
import { Photo } from '@/types/photo';

interface UseValidatedImagesResult {
  photos: Photo[];
  failedSrcs: Set<string>;
  handleImageError: (src: string) => void;
}

export function useValidatedImages(photos: Photo[]): UseValidatedImagesResult {
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());

  const photosWithSrc = photos.filter(photo => photo.src?.trim());

  const handleImageError = useCallback((src: string) => {
    setFailedSrcs(prev => new Set(prev).add(src));
  }, []);

  return { photos: photosWithSrc, failedSrcs, handleImageError };
}
