import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  isHidden: boolean;
  isApproved: boolean; // Approved by admin
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    adminReply: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", reviewSchema);
