import Review, { IReview } from "./review.model";
import { Types } from "mongoose";

export const createReview = async (reviewData: Partial<IReview>) => {
  return Review.create(reviewData);
};

export const findReviewByUserAndProduct = async (userId: Types.ObjectId, productId: Types.ObjectId) => {
  return Review.findOne({ product: productId, user: userId }).exec();
};

export const getReviewsForProduct = async (productId: string) => {
  return Review.find({ product: productId, isHidden: false, isApproved: true })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

export const getAllReviews = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return Review.find({})
    .populate("user", "name email")
    .populate("product", "name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

export const countReviews = async () => {
  return Review.countDocuments();
};

export const getReviewById = async (id: string) => {
  return Review.findById(id).exec();
};

export const getApprovedReviewsByProduct = async (productId: any) => {
  return Review.find({ product: productId, isApproved: true, isHidden: false }).exec();
};

export const getReviewedProductsByUser = async (userId: Types.ObjectId, productIds: Types.ObjectId[]) => {
  return Review.find({
    user: userId,
    product: { $in: productIds }
  }).select("product").exec();
};
