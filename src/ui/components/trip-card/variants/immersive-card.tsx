import Image from 'next/image';
import Link from 'next/link';
import { Trip } from '@/types/trip';
import { getTripRoute } from '@/utils/route';
import './immersive-card.css';

interface ImmersiveCardProps {
  trip: Trip;
  priority: boolean;
}

export function ImmersiveCard({ trip, priority }: ImmersiveCardProps) {
  return (
    <Link href={getTripRoute(trip.id)} className="group immersive-card">
      <Image
        src={trip.coverPhoto}
        alt={trip.name}
        fill
        priority={priority}
        className="immersive-card__image"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      <div className="immersive-card__primary-gradient" />
      <div className="immersive-card__hover-gradient" />

      <div className="immersive-card__badge-container">
        <div className="immersive-card__country-badge">
          {trip.countries[0]}
        </div>
      </div>

      <div className="immersive-card__content">
        {trip.year && (
          <div className="immersive-card__year-badge">
            {trip.year}
          </div>
        )}
        <h2 className="immersive-card__title">
          {trip.name}
        </h2>
        {trip.description && (
          <p className="immersive-card__description">
            {trip.description}
          </p>
        )}
        <div className="immersive-card__explore">
          <span className="immersive-card__explore-text">Explore journey</span>
          <svg className="immersive-card__explore-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
