import heicConvert from 'heic-convert';
import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, extname, basename } from 'path';

const galleryDir = new URL('../public/images/gallery/', import.meta.url).pathname.replace(/^\//, '');

const files = await readdir(galleryDir);
const heicFiles = files.filter(f => extname(f).toLowerCase() === '.heic');

console.log(`Found ${heicFiles.length} HEIC files to convert...`);

let converted = 0;
let skipped = 0;
let failed = 0;

for (const file of heicFiles) {
  const inputPath = join(galleryDir, file);
  const outputName = basename(file, extname(file)) + '.jpg';
  const outputPath = join(galleryDir, outputName);

  try {
    await access(outputPath);
    console.log(`  skip  ${outputName} (already exists)`);
    skipped++;
    continue;
  } catch {
    // doesn't exist, proceed
  }

  try {
    const inputBuffer = await readFile(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.85,
    });
    await writeFile(outputPath, Buffer.from(outputBuffer));
    console.log(`  ok    ${outputName}`);
    converted++;
  } catch (err) {
    console.error(`  FAIL  ${file}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${converted} converted, ${skipped} skipped, ${failed} failed`);
