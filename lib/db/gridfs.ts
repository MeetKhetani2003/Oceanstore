import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let buckets: Record<string, GridFSBucket> = {};

export function getGridFSBucket(bucketName: string = "uploads"): GridFSBucket {
  if (!buckets[bucketName]) {
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB not connected");
    buckets[bucketName] = new GridFSBucket(db, { bucketName });
  }
  return buckets[bucketName];
}

export const BUCKET_NAMES = {
  PRODUCTS: "product-images",
  CATEGORIES: "category-images",
  PROFILES: "profile-images",
  INVOICES: "invoices",
  BANNERS: "banners",
  ASSETS: "assets",
} as const;

export type BucketName = (typeof BUCKET_NAMES)[keyof typeof BUCKET_NAMES];

export function resetBuckets() {
  buckets = {};
}
