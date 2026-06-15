import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  costPrice: number;
  stock: number;
  reservedStock: number;
  brand?: string;
  category: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId;
  images: string[]; // GridFS file ID references
  gallery: string[]; // GridFS file ID references
  tags: string[];
  featured: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, required: true, default: 0, min: 0 },
    brand: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    images: [{ type: String }],
    gallery: [{ type: String }],
    tags: [{ type: String, index: true }],
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

// MongoDB Text Search Index
ProductSchema.index(
  { name: 'text', brand: 'text', tags: 'text', description: 'text' },
  { weights: { name: 10, brand: 5, tags: 3, description: 1 } }
);

// Compound Index for Category & Slug lookups
ProductSchema.index({ category: 1, slug: 1 });

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
