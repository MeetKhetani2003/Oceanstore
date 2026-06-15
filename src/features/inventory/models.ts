import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryHistory {
  adjustmentType: 'ADDITION' | 'REDUCTION' | 'DAMAGED' | 'RETURNED' | 'SALE' | 'RESERVATION';
  quantity: number;
  notes?: string;
  date: Date;
}

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  damagedStock: number;
  returnedStock: number;
  stockHistory: IInventoryHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockReservation extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  quantity: number;
  expiresAt: Date;
  createdAt: Date;
  orderId?: mongoose.Types.ObjectId;
}

const InventoryHistorySchema = new Schema<IInventoryHistory>({
  adjustmentType: {
    type: String,
    enum: ['ADDITION', 'REDUCTION', 'DAMAGED', 'RETURNED', 'SALE', 'RESERVATION'],
    required: true,
  },
  quantity: { type: Number, required: true },
  notes: { type: String },
  date: { type: Date, default: Date.now },
});

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true, index: true },
    availableStock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, required: true, default: 0, min: 0 },
    soldStock: { type: Number, required: true, default: 0, min: 0 },
    damagedStock: { type: Number, required: true, default: 0, min: 0 },
    returnedStock: { type: Number, required: true, default: 0, min: 0 },
    stockHistory: [InventoryHistorySchema],
  },
  { timestamps: true }
);

const StockReservationSchema = new Schema<IStockReservation>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

export const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
export const StockReservation: Model<IStockReservation> = mongoose.models.StockReservation || mongoose.model<IStockReservation>('StockReservation', StockReservationSchema);
