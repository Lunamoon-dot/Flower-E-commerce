import mongoose, { Schema, Document } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  type: "percent" | "fixed" | "freeship";
  value: number; // percentage or fixed amount
  minOrderValue: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed", "freeship"], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVoucher>("Voucher", voucherSchema);
