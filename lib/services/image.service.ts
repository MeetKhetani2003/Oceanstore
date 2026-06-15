import sharp from "sharp";
import { Readable } from "stream";
import { getGridFSBucket, BUCKET_NAMES } from "@/lib/db/gridfs";
import { v4 as uuidv4 } from "uuid";
import connectDB from "@/lib/db/connect";

export type ImageSize = "thumbnail" | "small" | "medium" | "large" | "original";

export interface ImageVariantResult {
  fileId: string;
  size: ImageSize;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadResult {
  variants: ImageVariantResult[];
  blurDataURL: string;
}

const SIZE_CONFIGS: Record<Exclude<ImageSize, "original">, { width: number }> = {
  thumbnail: { width: 80 },
  small: { width: 400 },
  medium: { width: 800 },
  large: { width: 1200 },
};

export async function uploadImage(
  buffer: Buffer,
  bucketName: string = BUCKET_NAMES.PRODUCTS,
  filename?: string
): Promise<UploadResult> {
  await connectDB();
  const bucket = getGridFSBucket(bucketName);
  const baseName = filename || uuidv4();

  // Generate blur placeholder (10px wide, base64)
  const blurBuffer = await sharp(buffer)
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const variants: ImageVariantResult[] = [];

  // Upload original
  const originalMeta = await sharp(buffer).metadata();
  const originalFileId = await uploadToGridFS(
    bucket,
    buffer,
    `${baseName}-original.webp`,
    { size: "original", originalWidth: originalMeta.width, originalHeight: originalMeta.height }
  );
  const originalInfo = await sharp(buffer).toBuffer({ resolveWithObject: true });
  variants.push({
    fileId: originalFileId,
    size: "original",
    width: originalMeta.width || 0,
    height: originalMeta.height || 0,
    format: "webp",
    bytes: originalInfo.info.size,
  });

  // Upload each size variant
  for (const [sizeName, config] of Object.entries(SIZE_CONFIGS) as [
    Exclude<ImageSize, "original">,
    { width: number }
  ][]) {
    const resized = await sharp(buffer)
      .resize(config.width, undefined, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: sizeName === "thumbnail" ? 70 : 85 })
      .toBuffer({ resolveWithObject: true });

    const fileId = await uploadToGridFS(
      bucket,
      resized.data,
      `${baseName}-${sizeName}.webp`,
      { size: sizeName, width: resized.info.width, height: resized.info.height }
    );

    variants.push({
      fileId,
      size: sizeName,
      width: resized.info.width,
      height: resized.info.height,
      format: "webp",
      bytes: resized.info.size,
    });
  }

  return { variants, blurDataURL };
}

async function uploadToGridFS(
  bucket: ReturnType<typeof getGridFSBucket>,
  buffer: Buffer,
  filename: string,
  metadata: Record<string, unknown>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
      contentType: "image/webp",
    });

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);

    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.on("error", reject);
  });
}

export async function streamFileFromGridFS(
  fileId: string,
  bucketName: string = BUCKET_NAMES.PRODUCTS
): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
  filename: string;
} | null> {
  await connectDB();
  const bucket = getGridFSBucket(bucketName);
  const { ObjectId } = await import("mongodb");

  try {
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    if (files.length === 0) return null;

    const file = files[0];
    const stream = bucket.openDownloadStream(new ObjectId(fileId));

    return {
      stream,
      contentType: file.contentType || "image/webp",
      filename: file.filename,
    };
  } catch {
    return null;
  }
}

export async function deleteImageFromGridFS(
  fileId: string,
  bucketName: string = BUCKET_NAMES.PRODUCTS
): Promise<void> {
  await connectDB();
  const bucket = getGridFSBucket(bucketName);
  const { ObjectId } = await import("mongodb");
  try {
    await bucket.delete(new ObjectId(fileId));
  } catch {
    // File may not exist, ignore
  }
}

export function getImageUrl(
  fileId: string,
  size: ImageSize = "medium"
): string {
  return `/api/images/${fileId}?size=${size}`;
}
