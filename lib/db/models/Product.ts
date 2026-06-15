import mongoose, { Document, Schema, Model } from "mongoose";

export interface IImageVariant {
  fileId: string; // GridFS file ID
  size: "thumbnail" | "small" | "medium" | "large" | "original";
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface IProductImage {
  variants: IImageVariant[];
  blurDataURL: string;
  alt?: string;
  isPrimary: boolean;
}

export interface ISeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface IInventory {
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  returnedStock: number;
  damagedStock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryRef?: mongoose.Types.ObjectId;
  tab: string;
  price: number;
  comparePrice?: number;
  unit: string;
  badge?: "New" | "Bestseller" | "Limited" | "Sale";
  origin?: string;
  images: IProductImage[];
  externalImages: string[]; // Pexels URLs for seed data
  seo: ISeo;
  inventory: IInventory;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  tags: string[];
  attributes: Record<string, string>;
  rating: { average: number; count: number };
  createdAt: Date;
  updatedAt: Date;
}

const ImageVariantSchema = new Schema<IImageVariant>(
  {
    fileId: String,
    size: {
      type: String,
      enum: ["thumbnail", "small", "medium", "large", "original"],
    },
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
  },
  { _id: false }
);

const ProductImageSchema = new Schema<IProductImage>(
  {
    variants: [ImageVariantSchema],
    blurDataURL: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const SeoSchema = new Schema<ISeo>(
  {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String,
  },
  { _id: false }
);

const InventorySchema = new Schema<IInventory>(
  {
    availableStock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    soldStock: { type: Number, default: 0, min: 0 },
    returnedStock: { type: Number, default: 0, min: 0 },
    damagedStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    shortDescription: String,
    category: { type: String, required: true },
    categoryRef: { type: Schema.Types.ObjectId, ref: "Category" },
    tab: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    unit: { type: String, required: true },
    badge: {
      type: String,
      enum: ["New", "Bestseller", "Limited", "Sale"],
    },
    origin: String,
    images: { type: [ProductImageSchema], default: [] },
    externalImages: { type: [String], default: [] },
    seo: { type: SeoSchema, default: {} },
    inventory: { type: InventorySchema, default: {} },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    weight: Number,
    tags: { type: [String], default: [] },
    attributes: { type: Map, of: String, default: {} },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Indexes
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ tab: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ "inventory.availableStock": 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
