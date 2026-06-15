import sharp from 'sharp';
import { uploadToGridFS } from './gridfs';

export interface OptimizedImageVersions {
  original: string;
  large: string;
  medium: string;
  small: string;
  thumbnail: string;
  blurDataUrl: string;
  metadata: {
    width: number;
    height: number;
    aspectRatio: number;
    mimeType: string;
  };
}

export async function processAndUploadImage(
  buffer: Buffer,
  originalFilename: string
): Promise<OptimizedImageVersions> {
  const image = sharp(buffer);
  const meta = await image.metadata();

  if (!meta.width || !meta.height) {
    throw new Error('Could not read image dimensions');
  }

  const width = meta.width;
  const height = meta.height;
  const aspectRatio = width / height;
  const mimeType = 'image/webp';

  // Generate Blur Placeholder (10px width)
  const blurBuffer = await sharp(buffer)
    .resize(10)
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

  // Target sizes
  const sizes = {
    large: 1600,
    medium: 800,
    small: 400,
    thumbnail: 150,
  };

  const uploadVersion = async (targetWidth: number, nameSuffix: string) => {
    const processed = sharp(buffer)
      .rotate()
      .resize(targetWidth, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const outputBuffer = await processed;
    const cleanFilename = originalFilename.replace(/\.[^/.]+$/, "");
    const filename = `${cleanFilename}_${nameSuffix}.webp`;
    
    const id = await uploadToGridFS(outputBuffer, filename, mimeType, {
      width: Math.min(targetWidth, width),
      height: Math.min(Math.round(targetWidth / aspectRatio), height),
      size: outputBuffer.length,
      mimeType,
    });
    
    return id;
  };

  // Upload original as WebP
  const originalWebpBuffer = await sharp(buffer)
    .rotate()
    .webp({ quality: 85 })
    .toBuffer();
  
  const cleanFilename = originalFilename.replace(/\.[^/.]+$/, "");
  const originalId = await uploadToGridFS(
    originalWebpBuffer,
    `${cleanFilename}_original.webp`,
    mimeType,
    {
      width,
      height,
      size: originalWebpBuffer.length,
      mimeType,
    }
  );

  // Resize and upload splits
  const [largeId, mediumId, smallId, thumbnailId] = await Promise.all([
    uploadVersion(sizes.large, 'large'),
    uploadVersion(sizes.medium, 'medium'),
    uploadVersion(sizes.small, 'small'),
    uploadVersion(sizes.thumbnail, 'thumbnail'),
  ]);

  return {
    original: originalId,
    large: largeId,
    medium: mediumId,
    small: smallId,
    thumbnail: thumbnailId,
    blurDataUrl,
    metadata: {
      width,
      height,
      aspectRatio,
      mimeType,
    },
  };
}
export default processAndUploadImage;
