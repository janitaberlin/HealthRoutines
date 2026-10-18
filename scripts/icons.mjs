// Erzeugt die PNG-App-Icons aus public/icon.svg bzw. public/icon-maskable.svg.
import sharp from 'sharp';

const jobs = [
  ['public/icon.svg', 'public/icon-192.png', 192],
  ['public/icon.svg', 'public/icon-512.png', 512],
  ['public/icon-maskable.svg', 'public/icon-maskable-512.png', 512],
  ['public/icon-maskable.svg', 'public/apple-touch-icon.png', 180],
];
for (const [input, output, size] of jobs) {
  await sharp(input, { density: 300 }).resize(size, size).png().toFile(output);
  console.log(output);
}
