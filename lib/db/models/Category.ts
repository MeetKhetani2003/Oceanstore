import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategoryImage {
  fileId?: string;
  externalUrl?: string;
  blurDataURL?: string;
  alt?: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  blurb: string;
  image: ICategoryImage;
  order: number;
  count?: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    blurb: { type: String, default: "" },
    image: {
      fileId: String,
      externalUrl: String,
      blurDataURL: String,
      alt: String,
    },
    order: { type: Number, default: 0 },
    count: String,
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ order: 1 });
CategorySchema.index({ isActive: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
