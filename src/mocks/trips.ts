import { Trip } from '@/types/trip';

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
