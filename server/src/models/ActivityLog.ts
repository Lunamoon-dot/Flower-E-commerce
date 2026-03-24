import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
  admin: Types.ObjectId;
  action: string;
  description: string;
  targetId?: string; // e.g. orderId, productId
  targetModel?: string; // e.g. "Order", "Product"
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    targetId: { type: String },
    targetModel: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
