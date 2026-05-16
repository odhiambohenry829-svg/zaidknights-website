/**
 * Populates the gallery with all JPG/JPEG images from public/images/gallery/.
 * Assigns categories and titles based on date groups.
 * Safe to re-run — skips imageUrls already in the database.
 */
import { PrismaClient } from '@prisma/client';
import { readdir } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const galleryDir = join(__dirname, '../public/images/gallery');
const prisma = new PrismaClient();

// Derive category and a human-readable title from the filename
function classifyFile(name) {
  // Screenshot / social media files
  if (name.startsWith('Screenshot_')) {
    const match = name.match(/(\d{8})/);
    if (match) {
      const d = match[1];
      const date = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
      return { title: `Club Update – ${formatDate(date)}`, category: 'events' };
    }
    return { title: 'Club Update', category: 'general' };
  }
  if (name.startsWith('Snapchat-')) return { title: 'Club Moment', category: 'general' };
  if (name.startsWith('WA_'))       return { title: 'Club Activity', category: 'general' };

  // Timestamped files: YYYYMMDD_HHMMSS
  const match = name.match(/^(\d{8})_(\d{6})/);
  if (!match) return { title: name.replace(/\.\w+$/, ''), category: 'general' };

  const date = `${match[1].slice(0,4)}-${match[1].slice(4,6)}-${match[1].slice(6,8)}`;
  const formatted = formatDate(date);

  // Assign categories based on known event date clusters
  const day = match[1]; // YYYYMMDD
  let title, category;

  if (day.startsWith('20251003')) { title = `Training Session – ${formatted}`;        category = 'training';     }
  else if (day.startsWith('20251011')) { title = `Training Session – ${formatted}`;   category = 'training';     }
  else if (day.startsWith('20251014')) { title = `Club Tournament – ${formatted}`;    category = 'tournaments';  }
  else if (day.startsWith('20251018')) { title = `Club Event – ${formatted}`;         category = 'events';       }
  else if (day.startsWith('20251019')) { title = `Club Event – ${formatted}`;         category = 'events';       }
  else if (day.startsWith('20251108')) { title = `Zaid Knights – ${formatted}`;       category = 'general';      }
  else if (day.startsWith('20251112')) { title = `Club Event – ${formatted}`;         category = 'events';       }
  else if (day.startsWith('20251119')) { title = `Zaid Knights – ${formatted}`;       category = 'general';      }
  else { title = `Zaid Knights – ${formatted}`; category = 'general'; }

  return { title, category };
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}

async function main() {
  const files = await readdir(galleryDir);
  const images = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(extname(f)));

  console.log(`Found ${images.length} image files.`);

  // Fetch existing imageUrls to avoid duplicates
  const existing = await prisma.galleryItem.findMany({ select: { imageUrl: true } });
  const existingUrls = new Set(existing.map(e => e.imageUrl));
  console.log(`Database has ${existingUrls.size} existing entries.`);

  const toInsert = images
    .filter(name => !existingUrls.has(`/images/gallery/${name}`))
    .map(name => {
      const { title, category } = classifyFile(name);
      return { title, imageUrl: `/images/gallery/${name}`, caption: null, category };
    });

  if (toInsert.length === 0) {
    console.log('Nothing new to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} new gallery items...`);
  const result = await prisma.galleryItem.createMany({ data: toInsert });
  console.log(`Done. Inserted ${result.count} items.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
