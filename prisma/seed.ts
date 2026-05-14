import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const galleryItems = [
  {
    title: 'Training Session Review',
    imageUrl: '/images/gallery/training-session-review.jpg',
    caption: 'Club members analyzing games and reviewing chess positions together',
    category: 'training',
  },
  {
    title: 'Zaid Knights Coaching Program',
    imageUrl: '/images/gallery/club-flyer-coaching.jpg',
    caption: 'Join our coaching — boost brain strength, speed & strategy at any level',
    category: 'general',
  },
  {
    title: 'Chess Study Session',
    imageUrl: '/images/gallery/player-chess-study.jpg',
    caption: 'Deep in thought — studying the board and sharpening the mind',
    category: 'training',
  },
  {
    title: 'KCB Chess Open 2025 Trophy',
    imageUrl: '/images/gallery/kcb-chess-open-2025-trophy.jpg',
    caption: 'The lion trophy awarded to the Open category winner at KCB Chess Open 2025',
    category: 'tournaments',
  },
  {
    title: 'Tournament Concentration',
    imageUrl: '/images/gallery/tournament-player-focus.jpg',
    caption: 'A Zaid Knights player locked in during a competitive tournament round',
    category: 'tournaments',
  },
  {
    title: 'Club Registration',
    imageUrl: '/images/gallery/event-registration.jpg',
    caption: 'Signing up and beginning the journey with Zaid Knights',
    category: 'events',
  },
  {
    title: 'Zaid Knights Chess Club',
    imageUrl: '/images/gallery/zaid-knights-brand-art.jpg',
    caption: 'Sharpening great minds — official Zaid Knights Chess Club branding',
    category: 'team',
  },
  {
    title: 'Chess Under the Rainbow',
    imageUrl: '/images/gallery/chess-under-rainbow.jpg',
    caption: 'A memorable game with a breathtaking outdoor backdrop',
    category: 'general',
  },
  {
    title: 'Zaid Knights Logo',
    imageUrl: '/images/gallery/zaid-knights-logo.jpg',
    caption: null,
    category: 'general',
  },
  {
    title: 'Soviet Middlegame Technique',
    imageUrl: '/images/gallery/chess-study-middlegame.jpg',
    caption: 'Studying the classics — middlegame mastery with Peter Romanovsky',
    category: 'training',
  },
  {
    title: 'Zaid Knight Chess Club Banner',
    imageUrl: '/images/gallery/zaid-knight-chess-club-banner.jpg',
    caption: null,
    category: 'general',
  },
];

async function main() {
  console.log('Seeding gallery...');

  const existing = await prisma.galleryItem.count();
  if (existing > 0) {
    console.log(`Gallery already has ${existing} items — skipping seed.`);
    return;
  }

  await prisma.galleryItem.createMany({ data: galleryItems });
  console.log(`Seeded ${galleryItems.length} gallery items.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
