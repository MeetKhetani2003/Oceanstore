import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  bannerId?: string; // GridFS reference
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String },
    bannerId: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    featured: { type: Boolean, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
