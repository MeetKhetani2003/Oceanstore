import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import connectDB from '@/lib/db';

let bucket: GridFSBucket | null = null;

export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (bucket) return bucket;

  const db = await connectDB();
  const rawDb = db.connection.db;
  if (!rawDb) {
    throw new Error('Database connection not established for GridFS');
  }

  bucket = new GridFSBucket(rawDb, {
    bucketName: 'uploads',
  });
  return bucket;
}

export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string,
  metadata?: any
): Promise<string> {
  const activeBucket = await getGridFSBucket();
  
  return new Promise((resolve, reject) => {
    const uploadStream = activeBucket.openUploadStream(filename, {
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
      },
    } as any);

    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.on('error', (err) => {
      reject(err);
    });

    uploadStream.end(buffer);
  });
}

export async function deleteFromGridFS(fileId: string): Promise<boolean> {
  try {
    const activeBucket = await getGridFSBucket();
    await activeBucket.delete(new ObjectId(fileId));
    return true;
  } catch (error) {
    console.error('GridFS delete error:', error);
    return false;
  }
}

export async function downloadFromGridFS(fileId: string): Promise<any> {
  const activeBucket = await getGridFSBucket();
  return activeBucket.openDownloadStream(new ObjectId(fileId));
}
