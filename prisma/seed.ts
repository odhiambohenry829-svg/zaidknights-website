import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helpers
function entries(
  files: string[],
  title: string,
  category: string,
  caption?: string
) {
  return files.map(f => ({ title, imageUrl: `/images/gallery/${f}`, caption: caption ?? null, category }));
}

const galleryItems = [
  ...entries(
    ['20251003_194648.jpg', '20251003_194651.jpg', '20251003_194700.jpg', '20251003_194709.jpg'],
    'Training Session – Oct 3, 2025', 'training'
  ),
  ...entries(
    ['20251011_100210.jpg', '20251011_100230.jpg'],
    'Training Session – Oct 11, 2025', 'training'
  ),
  ...entries(
    [
      '20251014_171920.jpg', '20251014_171923.jpg', '20251014_171930.jpg',
      '20251014_172114.jpg', '20251014_172122.jpg', '20251014_172509.jpg',
      '20251014_172511.jpg', '20251014_172518.jpg', '20251014_172521.jpg',
      '20251014_172522.jpg', '20251014_172608.jpg', '20251014_173824.jpg',
      '20251014_173826.jpg', '20251014_173830.jpg', '20251014_173834.jpg',
      '20251014_173845.jpg', '20251014_173847.jpg', '20251014_173851(0).jpg',
      '20251014_173851.jpg', '20251014_173854.jpg', '20251014_173856.jpg',
      '20251014_173859.jpg', '20251014_173904.jpg', '20251014_173907.jpg',
      '20251014_173933.jpg', '20251014_173938.jpg', '20251014_173939.jpg',
      '20251014_173942.jpg', '20251014_173943.jpg',
    ],
    'Club Tournament – Oct 14, 2025', 'tournaments'
  ),
  ...entries(
    [
      '20251018_090237.jpg', '20251018_090240.jpg', '20251018_090243.jpg',
      '20251018_090259.jpg', '20251018_090302.jpg', '20251018_090305.jpg',
      '20251018_090306.jpg', '20251018_090307.jpg', '20251018_090319.jpg',
      '20251018_090321.jpg', '20251018_090803.jpg', '20251018_093006.jpg',
      '20251018_093010.jpg', '20251018_093018.jpg', '20251018_093019.jpg',
      '20251018_093329.jpg', '20251018_093334.jpg', '20251018_093340.jpg',
      '20251018_094133.jpg', '20251018_094137.jpg',
      'Screenshot_20251018_102414_WhatsApp.jpg',
    ],
    'Club Event – Oct 18, 2025', 'events'
  ),
  ...entries(
    [
      '20251019_084235.jpg', '20251019_084248.jpg', '20251019_084250.jpg',
      '20251019_084253.jpg', '20251019_084255.jpg', '20251019_084652.jpg',
      '20251019_084706.jpg', '20251019_084709.jpg', '20251019_085953.jpg',
      '20251019_085954.jpg', '20251019_115840.jpg', '20251019_115843.jpg',
      '20251019_120031.jpg', '20251019_120034.jpg', '20251019_120037.jpg',
      '20251019_152649.jpg', '20251019_152651.jpg', '20251019_153943.jpg',
      '20251019_161800.jpg', '20251019_161816.jpg', '20251019_161818.jpg',
      '20251019_161821.jpg', '20251019_161839.jpg', '20251019_161843.jpg',
      '20251019_161846.jpg', '20251019_161851.jpg', '20251019_161853.jpg',
      '20251019_205241.jpg', '20251019_205256.jpg',
      'Screenshot_20251019_201134_WhatsApp.jpg',
    ],
    'Club Event – Oct 19, 2025', 'events'
  ),
  ...entries(['20251108_141349.jpg'], 'Zaid Knights – Nov 8, 2025', 'general'),
  ...entries(
    [
      '20251112_151315.jpg', '20251112_155423.jpg', '20251112_155433.jpg',
      '20251112_155446.jpg', '20251112_155521.jpg', '20251112_155527.jpg',
      '20251112_163324.jpg', '20251112_163327.jpg',
    ],
    'Club Event – Nov 12, 2025', 'events'
  ),
  ...entries(['20251119_151514.jpg'], 'Zaid Knights – Nov 19, 2025', 'general'),
  ...entries(
    [
      'Screenshot_20251025_144620_WhatsApp.jpg',
      'Screenshot_20260115_162051_Instagram.jpg',
      'Screenshot_20260203_022413_WhatsAppBusiness.jpg',
      'Screenshot_20260207_144757_ChatGPT.jpg',
      'Screenshot_20260219_124413_Google.jpg',
      'Screenshot_20260225_034432_Instagram.jpg',
      'Snapchat-583996864.jpg',
      'WA_1777889542626.jpeg',
    ],
    'Zaid Knights Update', 'general'
  ),
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
