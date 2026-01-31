'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { PolaroidCardVariant } from '@/enums/polaroid-card-variant';
import { ImagePlaceholder } from '@/ui/components/image-placeholder/image-placeholder';
import './polaroid-card.css';

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

  const getPhotoImageContainerClass = (aspectRatio?: 'square' | 'portrait') => {
    const modifier = aspectRatio === 'square' ? 'square' : 'portrait';
    return `polaroid-photo-image-container polaroid-photo-image-container--${modifier}`;
  };

  const renderPolaroidContent = () => {
    if (variant === PolaroidCardVariant.Trip) {
      const tripProps = props as TripPolaroidCardProps;
      return (
        <>
          <div className="polaroid-trip-image-container">
            {!imageError ? (
              <Image
                src={tripProps.imageSrc}
                alt={tripProps.title}
                fill
                priority={priority}
                className="polaroid-trip-image"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={handleImageError}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
          <div className="polaroid-trip-content">
            <h2 className="polaroid-trip-title">
              {tripProps.title}
            </h2>
            <p className="polaroid-trip-subtitle">
              {tripProps.subtitle}
            </p>
            {tripProps.description && (
              <p className="polaroid-trip-description">
                {tripProps.description}
              </p>
            )}
          </div>
        </>
      );
    }

    const photoProps = props as PhotoPolaroidCardProps;

    return (
      <>
        <div className={getPhotoImageContainerClass(photoProps.aspectRatio)}>
          {!imageError ? (
            <Image
              src={photoProps.imageSrc}
              alt={photoProps.imageAlt}
              fill
              className="polaroid-photo-image"
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
              onError={handleImageError}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        <div className="polaroid-photo-caption-container">
          {photoProps.caption && (
            <p className="polaroid-photo-caption">
              {photoProps.caption}
            </p>
          )}
        </div>
      </>
    );
  };

  const frameClass = variant === PolaroidCardVariant.Trip
    ? 'polaroid-frame polaroid-frame--trip'
    : 'polaroid-frame';

  const polaroidFrame = (
    <div className={frameClass}>
      {renderPolaroidContent()}
    </div>
  );

  if (variant === PolaroidCardVariant.Trip) {
    const tripProps = props as TripPolaroidCardProps;
    const linkClass = `polaroid-container polaroid-trip-link ${className}`.trim();
    return (
      <Link
        href={tripProps.href}
        className={linkClass}
        style={{ transform: getTransform() }}
      >
        {polaroidFrame}
      </Link>
    );
  }

  const containerClass = `polaroid-container polaroid-container--photo ${className}`.trim();
  return (
    <div
      className={containerClass}
      style={{ transform: getTransform() }}
    >
      {polaroidFrame}
    </div>
  );
}
