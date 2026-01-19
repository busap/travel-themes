import { Trip } from '@/types/trip';
import { pickRandom, pickMultiple, randomBoolean, randomInt } from './mock-utils';

// Mock data for generating random trips
const tripNames = [
  'Parisian Dreams',
  'Tokyo Nights',
  'Icelandic Wonders',
  'Sahara Sunset',
  'Alpine Adventure',
  'Mediterranean Magic',
  'Tropical Paradise',
  'Nordic Explorer',
  'Ancient Ruins',
  'City of Lights',
  'Mountain Escape',
  'Coastal Journey',
  'Desert Odyssey',
  'Island Hopping',
  'Urban Discovery',
  'Wilderness Trek',
  'Cultural Immersion',
  'Culinary Quest',
  'Architectural Marvels',
  'Hidden Gems',
];

const countriesPool = [
  'France', 'Japan', 'Iceland', 'Morocco', 'Switzerland', 'Italy', 'Greece',
  'Thailand', 'Norway', 'Peru', 'New Zealand', 'Spain', 'Portugal', 'Croatia',
  'Turkey', 'Mexico', 'Canada', 'Australia', 'Vietnam', 'Indonesia',
];

const descriptions = [
  'An unforgettable journey through stunning landscapes',
  'Where ancient tradition meets modern wonder',
  'A culinary and cultural adventure',
  'Exploring hidden corners and local secrets',
  'Breathtaking views at every turn',
  'An immersive experience in local culture',
  'Nature\'s masterpiece revealed',
  'Urban exploration and countryside charm',
  'From bustling markets to serene mountains',
  'A photographer\'s dream destination',
  'Historical treasures and contemporary delights',
  'Crystal waters and golden sunsets',
  'Adventure, relaxation, and everything between',
  'Architectural wonders and artistic inspiration',
  'A perfect blend of excitement and tranquility',
];

const unsplashPhotos = [
  'photo-1502602898657-3e91760cbb34', // Paris
  'photo-1493976040374-85c8e12f0c0e', // Japan
  'photo-1504893524553-b855bce32c67', // Iceland
  'photo-1489749798305-4fea3ae63d43', // Morocco
  'photo-1531366936337-7c912a4589a7', // Mountains
  'photo-1533105079780-92b9be482077', // Beach
  'photo-1476514525535-07fb3b4ae5f1', // Lake
  'photo-1506905925346-21bda4d32df4', // Mountains snow
  'photo-1520769669658-f07657f5a307', // Northern lights
  'photo-1539020140153-e479b8c22e70', // Desert
  'photo-1548017871-f3f70db8b4c3', // Blue city
  'photo-1528360983277-13d401cdc186', // Mount Fuji
  'photo-1499856871958-5b9627545d1a', // Paris Eiffel
  'photo-1513635269975-59663e0ac1ad', // London
  'photo-1467269204594-9661b134dd2b', // Countryside
];

/**
 * Generates a random trip with mock data
 * @param seed Optional seed for consistent randomization
 * @returns A randomly generated Trip object
 */
export const randomTrip = (seed?: string): Trip => {
  const id = seed || `trip-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const name = pickRandom(tripNames);
  const countryCount = randomBoolean(0.3) ? 2 : 1;
  const countries = pickMultiple(countriesPool, countryCount);
  const year = randomBoolean(0.8) ? randomInt(2020, 2024) : undefined;
  const description = randomBoolean(0.7) ? pickRandom(descriptions) : undefined;
  const coverPhoto = `https://images.unsplash.com/${pickRandom(unsplashPhotos)}?w=800&q=80`;

  const photoCount = randomInt(1, 4);
  const photos = Array.from({ length: photoCount }, (_, i) => ({
    src: `https://images.unsplash.com/${pickRandom(unsplashPhotos)}?w=1200&q=80`,
    title: randomBoolean(0.5) ? `Photo ${i + 1}` : undefined,
    description: randomBoolean(0.33) ? 'A beautiful moment captured' : undefined,
  }));

  return {
    id,
    name,
    countries,
    year,
    description,
    coverPhoto,
    photos,
  };
};

export const trips: Trip[] = [
  {
    id: 'japan-2023',
    name: 'Japan Adventures',
    countries: ['Japan'],
    year: 2023,
    description: 'Cherry blossoms, ancient temples, and neon-lit streets',
    coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
        title: 'Fushimi Inari Shrine',
        description: 'Thousands of vermillion torii gates',
      },
      {
        src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80',
        title: 'Tokyo at Night',
      },
      {
        src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
        title: 'Mount Fuji',
        description: 'Early morning view from Lake Kawaguchi',
      },
      {
        src: 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?w=1200&q=80',
      },
    ],
  },
  {
    id: 'morocco-markets',
    name: 'Colors of Morocco',
    countries: ['Morocco'],
    year: 2022,
    description: 'Vibrant souks, desert sunsets, and timeless medinas',
    coverPhoto: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80',
        title: 'Marrakech Medina',
      },
      {
        src: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80',
        title: 'Sahara Dunes',
        description: 'Golden hour in the desert',
      },
      {
        src: 'https://images.unsplash.com/photo-1548017871-f3f70db8b4c3?w=1200&q=80',
        title: 'Blue City',
        description: 'The streets of Chefchaouen',
      },
    ],
  },
  {
    id: 'nordic-winter',
    name: 'Nordic Winter',
    countries: ['Norway', 'Iceland'],
    year: 2024,
    description: 'Northern lights, frozen waterfalls, and snowy fjords',
    coverPhoto: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=1200&q=80',
        title: 'Aurora Borealis',
        description: 'Dancing lights over Tromsø',
      },
      {
        src: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80',
        title: 'Seljalandsfoss',
      },
      {
        src: 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=80',
        title: 'Norwegian Fjord',
      },
      {
        src: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&q=80',
        title: 'Reykjavik',
        description: 'Colorful houses in the winter',
      },
    ],
  },
];
