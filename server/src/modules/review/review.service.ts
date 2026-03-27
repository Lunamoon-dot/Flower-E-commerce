import * as reviewRepository from "./review.repository";
import { Types } from "mongoose";
import Order from "../order/order.model"; // Using Order model
import Product from "../product/product.model"; // Using Product model
import { sanitize } from "../../shared/utils/sanitizer";

export const createReview = async (userId: string, data: any) => {
  const { product: productId, rating, comment, orderId } = data;

  let userObjId: Types.ObjectId;
  let productObjId: Types.ObjectId;
  try {
    userObjId = new Types.ObjectId(userId);
    productObjId = new Types.ObjectId(productId as string);
  } catch {
    throw new Error("ID không hợp lệ");
  }

  let hasBought = null;
  if (orderId && Types.ObjectId.isValid(orderId)) {
    hasBought = await Order.findOne({
      _id: new Types.ObjectId(orderId as string),
      user: userObjId,
      status: "delivered",
      "items.product": productObjId
    });
  }
  
  if (!hasBought) {
    hasBought = await Order.findOne({
      user: userObjId,
      status: "delivered",
      "items.product": productObjId
    });
  }

  if (!hasBought) {
    throw new Error("Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hoa thành công");
  }

  const exists = await reviewRepository.findReviewByUserAndProduct(userObjId, productObjId);
  if (exists) {
    throw new Error("Bạn đã đánh giá sản phẩm này");
  }

  const review = await reviewRepository.createReview({
    product: productObjId,
    user: userObjId,
    order: hasBought?._id as Types.ObjectId,
    rating,
    comment: sanitize(comment)
  });

  const populated = await reviewRepository.getReviewById(review._id.toString());
  return await populated!.populate("user", "name avatar");
};

export const getProductReviews = async (productId: string) => {
  return reviewRepository.getReviewsForProduct(productId);
};

export const getAllReviews = async (page = 1, limit = 20) => {
  const [data, total] = await Promise.all([
    reviewRepository.getAllReviews(page, limit),
    reviewRepository.countReviews(),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateReview = async (id: string, data: any) => {
  const { isHidden, isApproved, adminReply } = data;
  const review = await reviewRepository.getReviewById(id);
  
  if (!review) {
    throw new Error("Review not found");
  }

  if (isHidden !== undefined) review.isHidden = isHidden;
  if (isApproved !== undefined) review.isApproved = isApproved;
  if (adminReply !== undefined) review.adminReply = sanitize(adminReply);

  const updated = await review.save();

  if (isApproved !== undefined || isHidden !== undefined) {
    const allApproved = await reviewRepository.getApprovedReviewsByProduct(review.product);
    const numReviews = allApproved.length;
    const rating = numReviews > 0 ? allApproved.reduce((acc, r) => acc + r.rating, 0) / numReviews : 0;
    
    await Product.findByIdAndUpdate(review.product, { numReviews, rating });
  }

  let actionDesc = "Cập nhật đánh giá";
  if (isApproved === true) actionDesc = "Duyệt đánh giá";
  else if (isApproved === false) actionDesc = "Bỏ duyệt đánh giá";
  else if (isHidden === true) actionDesc = "Ẩn đánh giá";
  else if (isHidden === false) actionDesc = "Hiện đánh giá";
  else if (adminReply !== undefined) actionDesc = "Phản hồi đánh giá";

  return { updated, actionDesc, reviewId: review._id.toString() };
};

export const getReviewOrderDetails = async (reviewId: string) => {
  const review = await reviewRepository.getReviewById(reviewId);
  if (!review) throw new Error("Review not found");

  // Truy xuất theo ID đơn hàng nếu có sẵn (đối với các đánh giá mới)
  if (review.order) {
    const order = await Order.findById(review.order);
    if (order) return order;
  }

  // Fallback: Tìm đơn hàng phù hợp dựa trên user và product (đối với các đánh giá cũ)
  // Bỏ điều kiện status: "delivered" để linh hoạt hơn cho quản trị viên (ví dụ: đơn hàng bị hủy sau khi đã đánh giá)
  const order = await Order.findOne({
    user: review.user,
    "items.product": review.product
  }).sort({ createdAt: -1 });

  if (!order) throw new Error("Order not found");
  return order;
};

export const canReview = async (userId: string, productId: string) => {
  let userObjId: Types.ObjectId;
  let productObjId: Types.ObjectId;
  try {
    userObjId = new Types.ObjectId(userId);
    productObjId = new Types.ObjectId(productId);
  } catch {
    return false;
  }

  const hasBought = await Order.findOne({
    user: userObjId,
    status: "delivered",
    "items.product": productObjId
  });

  if (!hasBought) return false;

  const exists = await reviewRepository.findReviewByUserAndProduct(userObjId, productObjId);
  return !exists;
};

export const getReviewedProductIds = async (userId: string, productIds: string[]) => {
  if (!productIds || productIds.length === 0) return [];
  
  const userObjId = new Types.ObjectId(userId);
  const productObjIds = productIds
    .filter(id => Types.ObjectId.isValid(id))
    .map(id => new Types.ObjectId(id));
    
  const reviews = await reviewRepository.getReviewedProductsByUser(userObjId, productObjIds);
  return reviews.map(r => r.product.toString());
};
