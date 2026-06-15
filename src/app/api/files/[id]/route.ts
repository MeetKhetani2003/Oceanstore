import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Readable } from 'stream';
import connectDB from '@/lib/db';
import { downloadFromGridFS } from '@/features/storage/gridfs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return new Response('Invalid file ID', { status: 400 });
    }

    const db = await connectDB();
    const filesCollection = db.connection.db.collection('uploads.files');
    const file = await filesCollection.findOne({ _id: new ObjectId(id) });

    if (!file) {
      return new Response('File not found', { status: 404 });
    }

    const downloadStream = await downloadFromGridFS(id);
    const webStream = Readable.toWeb(downloadStream);

    return new Response(webStream as any, {
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': file.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('File streaming route handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
