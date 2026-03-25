import { Request, Response } from "express";
import { Types } from "mongoose";
import Review from "../models/Review";
import Order from "../models/Order";
import Product from "../models/Product";
import { logActivity } from "./log.controller";

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product: productId, rating, comment, orderId } = req.body;
    const userId = (req as any).user.id;

    // Cast to ObjectId
    let userObjId: Types.ObjectId;
    let productObjId: Types.ObjectId;
    try {
      userObjId = new Types.ObjectId(userId);
      productObjId = new Types.ObjectId(productId as string);
    } catch {
      res.status(400).json({ message: "ID không hợp lệ" });
      return;
    }

    // Validate: user must have a delivered order containing this product
    let hasBought = null;
    if (orderId && Types.ObjectId.isValid(orderId)) {
      // Verify the specific order belongs to this user, is delivered, and contains the product
      hasBought = await Order.findOne({
        _id: new Types.ObjectId(orderId as string),
        user: userObjId,
        status: "delivered",
        "items.product": productObjId
      });
    }
    
    if (!hasBought) {
      // Fallback: check any delivered order
      hasBought = await Order.findOne({
        user: userObjId,
        status: "delivered",
        "items.product": productObjId
      });
    }

    console.log("[createReview] userId:", userId, "productId:", productId, "orderId:", orderId, "hasBought:", hasBought?._id ?? null);

    if (!hasBought) {
      res.status(400).json({ message: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hoa thành công" });
      return;
    }

    // Check duplicate review
    const exists = await Review.findOne({ product: productObjId, user: userObjId });
    if (exists) {
      res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này" });
      return;
    }

    const review = await Review.create({
      product: productObjId,
      user: userObjId,
      rating,
      comment
    });

    const populated = await Review.findById(review._id).populate("user", "name avatar");
    res.status(201).json(populated);

  } catch (error) {
    console.error("[createReview] Error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ 
      product: req.params.id, 
      isHidden: false,
      isApproved: true
    })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({})
      .populate("user", "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// @desc    Approve/Hide/Reply to a review (Admin)
// @route   PUT /api/admin/reviews/:id
// @access  Private/Admin
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isHidden, isApproved, adminReply } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    if (isHidden !== undefined) review.isHidden = isHidden;
    if (isApproved !== undefined) review.isApproved = isApproved;
    if (adminReply !== undefined) review.adminReply = adminReply;

    const updated = await review.save();

    let actionDesc = "Cập nhật đánh giá";
    if (isApproved === true) actionDesc = "Duyệt đánh giá";
    else if (isApproved === false) actionDesc = "Bỏ duyệt đánh giá";
    else if (isHidden === true) actionDesc = "Ẩn đánh giá";
    else if (isHidden === false) actionDesc = "Hiện đánh giá";
    else if (adminReply !== undefined) actionDesc = "Phản hồi đánh giá";

    await logActivity((req as any).user.id, "UPDATE_REVIEW", actionDesc, review._id.toString(), "Review");

    // Update product stats
    if (isApproved !== undefined || isHidden !== undefined) {
      // Recalc stats
      const allApproved = await Review.find({ product: review.product, isApproved: true, isHidden: false });
      const numReviews = allApproved.length;
      const rating = numReviews > 0 ? allApproved.reduce((acc, r) => acc + r.rating, 0) / numReviews : 0;
      
      await Product.findByIdAndUpdate(review.product, { numReviews, rating });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review" });
  }
};

// @desc    Check if user can review a product
// @route   GET /api/reviews/can-review/:productId
// @access  Private
export const canReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.json({ canReview: false }); return;
    }
    const productId = req.params.productId;

    let userObjId: Types.ObjectId;
    let productObjId: Types.ObjectId;
    try {
      userObjId = new Types.ObjectId(userId as string);
      productObjId = new Types.ObjectId(productId as string);
    } catch {
      res.json({ canReview: false }); return;
    }

    const hasBought = await Order.findOne({
      user: userObjId,
      status: "delivered",
      "items.product": productObjId
    });

    console.log("[canReview] userId:", userId, "productId:", productId, "hasBought:", hasBought?._id ?? null);
    
    if (!hasBought) {
      res.json({ canReview: false }); return;
    }

    const exists = await Review.findOne({ product: productObjId, user: userObjId });
    res.json({ canReview: !exists });
  } catch (err) {
    res.json({ canReview: false });
  }
}

// @desc    Get reviewed product IDs for a list of products (for current user)
// @route   POST /api/reviews/reviewed-products
// @access  Private
export const getReviewedProductIds = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { productIds } = req.body as { productIds: string[] };
    if (!userId || !Array.isArray(productIds) || productIds.length === 0) {
      res.json({ reviewedIds: [] }); return;
    }
    const userObjId = new Types.ObjectId(userId);
    const productObjIds = productIds
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    const reviews = await Review.find({
      user: userObjId,
      product: { $in: productObjIds }
    }).select("product");
    const reviewedIds = reviews.map(r => r.product.toString());
    res.json({ reviewedIds });
  } catch {
    res.json({ reviewedIds: [] });
  }
}
