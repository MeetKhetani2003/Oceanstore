import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  avatarId: string | null;
  isVerified: boolean;
  addresses?: {
    name?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  }[];
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
}

const AddressSchema = new Schema({
  name: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String }
});

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['CUSTOMER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN', 'customer', 'manager', 'admin', 'super_admin'], default: 'CUSTOMER' },
    avatarId: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    addresses: [AddressSchema],
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshToken: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
