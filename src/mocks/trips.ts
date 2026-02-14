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
  const selectedPhotos = pickMultiple(unsplashPhotos, photoCount);
  const photos = selectedPhotos.map((photoId, i) => ({
    src: `https://images.unsplash.com/${photoId}?w=1200&q=80`,
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
      {
        src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
        title: 'Kyoto Temple',
      },
      {
        src: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200&q=80',
        title: 'Shibuya Crossing',
      },
      {
        src: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=1200&q=80',
      },
      {
        src: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200&q=80',
        title: 'Cherry Blossoms',
      },
      {
        src: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80',
        title: 'Tokyo Tower',
      },
      {
        src: 'https://images.unsplash.com/photo-1552888968-e9a4302d3d4c?w=1200&q=80',
      },
      {
        src: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&q=80',
        title: 'Bamboo Forest',
      },
      {
        src: 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=1200&q=80',
        title: 'Osaka Castle',
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
      {
        src: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=80',
        title: 'Marrakech Souk',
        description: 'Colorful spices and textiles',
      },
      {
        src: 'https://images.unsplash.com/photo-1508171878746-d47039ce2499?w=1200&q=80',
        title: 'Ait Ben Haddou',
      },
      {
        src: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=1200&q=80',
        title: 'Fes Tannery',
        description: 'Traditional leather dyeing',
      },
      {
        src: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80',
        title: 'Essaouira Beach',
      },
      {
        src: 'https://images.unsplash.com/photo-1566995541428-6b4c21e30d08?w=1200&q=80',
        title: 'Majorelle Garden',
        description: 'Vibrant blue architecture',
      },
      {
        src: 'https://images.unsplash.com/photo-1591178999816-af0b4de2b6a6?w=1200&q=80',
        title: 'Casablanca Mosque',
      },
      {
        src: 'https://images.unsplash.com/photo-1562519767-b9be97fa9a8a?w=1200&q=80',
        title: 'Desert Caravan',
        description: 'Camel trek at sunset',
      },
      {
        src: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80',
        title: 'Moroccan Tea',
      },
      {
        src: 'https://images.unsplash.com/photo-1555881603-5d88a0f5c6f4?w=1200&q=80',
        title: 'Atlas Mountains',
        description: 'Traditional Berber village',
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
      {
        src: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&q=80',
        title: 'Lofoten Islands',
        description: 'Dramatic peaks and fishing villages',
      },
      {
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        title: 'Snowy Mountains',
      },
      {
        src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80',
        title: 'Swiss Alps',
        description: 'Winter wonderland',
      },
      {
        src: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&q=80',
        title: 'Jökulsárlón',
        description: 'Glacier lagoon with ice diamonds',
      },
      {
        src: 'https://images.unsplash.com/photo-1516850228053-8a97f7ff8a1a?w=1200&q=80',
        title: 'Blue Lagoon',
      },
      {
        src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
        title: 'Northern Lights',
        description: 'Green aurora over snowy landscape',
      },
      {
        src: 'https://images.unsplash.com/photo-1539717232966-433d38e36962?w=1200&q=80',
        title: 'Hallgrímskirkja',
        description: 'Iconic Reykjavik church',
      },
      {
        src: 'https://images.unsplash.com/photo-1467816574367-9a652a7c1a4f?w=1200&q=80',
        title: 'Geirangerfjord',
      },
      {
        src: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=1200&q=80',
        title: 'Frozen Waterfall',
        description: 'Ice formations at Skógafoss',
      },
    ],
  },
  {
    id: 'italian-escape',
    name: 'Italian Escape',
    countries: ['Italy'],
    year: 2023,
    description: 'Renaissance art, rolling hills, and coastal beauty',
    coverPhoto: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80',
        title: 'Venice Canals',
        description: 'Gondolas on the Grand Canal',
      },
      {
        src: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
        title: 'Roman Colosseum',
      },
      {
        src: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80',
        title: 'Tuscan Countryside',
        description: 'Rolling hills and vineyards',
      },
      {
        src: 'https://images.unsplash.com/photo-1534445538923-ab38438550d8?w=1200&q=80',
        title: 'Florence Cathedral',
      },
      {
        src: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&q=80',
        title: 'Amalfi Coast',
      },
    ],
  },
  {
    id: 'greek-islands',
    name: 'Greek Islands',
    countries: ['Greece'],
    year: 2022,
    description: 'White-washed villages, azure waters, and ancient history',
    coverPhoto: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
        title: 'Santorini Sunset',
        description: 'Iconic blue domes of Oia',
      },
      {
        src: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=1200&q=80',
        title: 'Mykonos Windmills',
      },
      {
        src: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80',
        title: 'Athens Acropolis',
      },
      {
        src: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80',
        title: 'Greek Coast',
      },
    ],
  },
  {
    id: 'thailand-adventure',
    name: 'Tropical Thailand',
    countries: ['Thailand'],
    year: 2024,
    description: 'Golden temples, jungle adventures, and island paradise',
    coverPhoto: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80',
        title: 'Bangkok Temple',
        description: 'Wat Arun at sunrise',
      },
      {
        src: 'https://images.unsplash.com/photo-1537458224466-780fe92b8338?w=1200&q=80',
        title: 'Phi Phi Islands',
      },
      {
        src: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1200&q=80',
        title: 'Phuket Beach',
      },
      {
        src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
        title: 'Chiang Mai',
        description: 'Mountain temples and night markets',
      },
    ],
  },
  {
    id: 'paris-romance',
    name: 'Parisian Dreams',
    countries: ['France'],
    year: 2023,
    description: 'Art, architecture, and timeless elegance',
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
        title: 'Paris at Dusk',
        description: 'The City of Lights awakens',
      },
      {
        src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
        title: 'Eiffel Tower',
      },
      {
        src: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=80',
        title: 'Louvre Museum',
      },
      {
        src: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80',
        title: 'Montmartre',
      },
    ],
  },
  {
    id: 'swiss-alps',
    name: 'Alpine Adventure',
    countries: ['Switzerland'],
    year: 2024,
    description: 'Majestic peaks, pristine lakes, and chocolate dreams',
    coverPhoto: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80',
        title: 'Matterhorn',
        description: 'Iconic Alpine peak',
      },
      {
        src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
        title: 'Lake Lucerne',
      },
      {
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        title: 'Swiss Slopes',
      },
    ],
  },
  {
    id: 'spain-fiesta',
    name: 'Spanish Fiesta',
    countries: ['Spain'],
    year: 2022,
    description: 'Flamenco rhythms, Gothic quarters, and Mediterranean sun',
    coverPhoto: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80',
        title: 'Barcelona',
        description: 'Sagrada Familia at twilight',
      },
      {
        src: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80',
        title: 'Seville',
      },
      {
        src: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
        title: 'Costa del Sol',
      },
      {
        src: 'https://images.unsplash.com/photo-1512187374372-3ecf4db53627?w=1200&q=80',
        title: 'Madrid',
      },
    ],
  },
  {
    id: 'australian-outback',
    name: 'Australian Adventure',
    countries: ['Australia'],
    year: 2023,
    description: 'Reef wonders, outback adventures, and coastal beauty',
    coverPhoto: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80',
        title: 'Sydney Opera House',
      },
      {
        src: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1200&q=80',
        title: 'Great Barrier Reef',
        description: 'Underwater paradise',
      },
      {
        src: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
        title: 'Bondi Beach',
      },
      {
        src: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=1200&q=80',
        title: 'Uluru',
        description: 'Heart of the Outback',
      },
    ],
  },
  {
    id: 'new-zealand',
    name: 'New Zealand Quest',
    countries: ['New Zealand'],
    year: 2024,
    description: 'Dramatic landscapes, Maori culture, and adventure sports',
    coverPhoto: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
        title: 'Milford Sound',
        description: 'Fjordland National Park',
      },
      {
        src: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&q=80',
        title: 'Queenstown',
      },
      {
        src: 'https://images.unsplash.com/photo-1464690661257-1a4c590e5b6d?w=1200&q=80',
        title: 'Mount Cook',
      },
    ],
  },
];
