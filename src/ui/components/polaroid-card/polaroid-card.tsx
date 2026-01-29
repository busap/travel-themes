'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { PolaroidCardVariant } from '@/enums/polaroid-card-variant';
import { ImagePlaceholder } from '@/ui/components/image-placeholder/image-placeholder';

interface BasePolaroidCardProps {
  variant?: PolaroidCardVariant;
  rotation?: number;
  scale?: number;
  offset?: { x: number; y: number };
  verticalOffset?: number;
  priority?: boolean;
  className?: string;
}

interface TripPolaroidCardProps extends BasePolaroidCardProps {
  variant: PolaroidCardVariant.Trip;
  imageSrc: string;
  title: string;
  subtitle: string;
  description?: string;
  href: string;
}

interface PhotoPolaroidCardProps extends BasePolaroidCardProps {
  variant: PolaroidCardVariant.Photo;
  imageSrc: string;
  imageAlt: string;
  caption?: string;
  aspectRatio?: 'square' | 'portrait';
  onImageError?: () => void;
}

export type PolaroidCardProps = TripPolaroidCardProps | PhotoPolaroidCardProps;

export function PolaroidCard(props: PolaroidCardProps) {
  const {
    variant = PolaroidCardVariant.Trip,
    rotation = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    verticalOffset = 0,
    priority = false,
    className = '',
  } = props;

  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    if (props.variant === PolaroidCardVariant.Photo && props.onImageError) {
      props.onImageError();
    }
  };

  const getTransform = () => {
    if (variant === PolaroidCardVariant.Photo) {
      return `rotate(${rotation}deg) translateY(${verticalOffset}px)`;
    }
    return `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`;
  };

  const renderPolaroidContent = () => {
    if (variant === PolaroidCardVariant.Trip) {
      const tripProps = props as TripPolaroidCardProps;
      return (
        <>
          <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            {!imageError ? (
              <Image
                src={tripProps.imageSrc}
                alt={tripProps.title}
                fill
                priority={priority}
                className="object-cover transition-all duration-500 group-hover:brightness-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={handleImageError}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
          <div className="mt-4 pb-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {tripProps.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {tripProps.subtitle}
            </p>
            {tripProps.description && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 italic">
                {tripProps.description}
              </p>
            )}
          </div>
        </>
      );
    }

    const photoProps = props as PhotoPolaroidCardProps;
    const aspectClass = photoProps.aspectRatio === 'square'
      ? 'aspect-square'
      : 'w-60 h-[300px] sm:w-72 sm:h-[360px] md:w-80 md:h-[400px]';

    return (
      <>
        <div className={`relative ${aspectClass} overflow-hidden`}>
          {!imageError ? (
            <Image
              src={photoProps.imageSrc}
              alt={photoProps.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
              onError={handleImageError}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        <div className="mt-3 sm:mt-4 text-center h-5 sm:h-6">
          {photoProps.caption && (
            <p className="text-xs sm:text-sm text-zinc-700">
              {photoProps.caption}
            </p>
          )}
        </div>
      </>
    );
  };

  const polaroidFrame = (
    <div
      className={`bg-white p-3 sm:p-4 shadow-2xl rounded-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-shadow duration-300 ${
        variant === PolaroidCardVariant.Trip ? 'dark:bg-zinc-800' : ''
      }`}
    >
      {renderPolaroidContent()}
    </div>
  );

  const containerClasses = `relative flex-shrink-0 transition-transform duration-300 ${
    variant === PolaroidCardVariant.Photo
      ? 'hover:scale-105 hover:z-20'
      : ''
  } ${className}`;

  if (variant === PolaroidCardVariant.Trip) {
    const tripProps = props as TripPolaroidCardProps;
    return (
      <Link
        href={tripProps.href}
        className={`${containerClasses} group block transition-all duration-500 hover:rotate-0 hover:scale-105 hover:shadow-2xl`}
        style={{ transform: getTransform() }}
      >
        {polaroidFrame}
      </Link>
    );
  }

  return (
    <div className={containerClasses} style={{ transform: getTransform() }}>
      {polaroidFrame}
    </div>
  );
}
