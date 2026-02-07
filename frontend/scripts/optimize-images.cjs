const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const distImagesDir = path.join(__dirname, '..', 'dist', 'images');

async function optimizeFile(filePath) {
  try {
    const { size } = fs.statSync(filePath);
    if (size < 100 * 1024) return;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const maxWidth = 1920;
    const quality = 80;

    let pipeline = image;
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth });
    }

    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      await pipeline.jpeg({ quality }).toFile(filePath + '.opt');
    } else if (metadata.format === 'png') {
      await pipeline.png({ quality }).toFile(filePath + '.opt');
    } else if (metadata.format === 'webp') {
      await pipeline.webp({ quality }).toFile(filePath + '.opt');
    } else {
      await pipeline.jpeg({ quality }).toFile(filePath + '.opt');
    }

    fs.renameSync(filePath + '.opt', filePath);
    console.log('Optimized:', path.relative(process.cwd(), filePath));
  } catch (err) {
    console.warn('Failed to optimize', filePath, err.message);
  }
}

async function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) await walk(p);
    else {
      const ext = path.extname(p).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        await optimizeFile(p);
      }
    }
  }
}

(async () => {
  console.log('Optimizing images in', distImagesDir);
  try {
    await walk(distImagesDir);
    console.log('Image optimization complete');
  } catch (err) {
    console.error('Image optimization failed:', err);
    process.exitCode = 1;
  }
})();
