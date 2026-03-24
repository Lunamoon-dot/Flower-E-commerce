import { Request, Response } from "express";
import Review from "../models/Review";
import Order from "../models/Order";
import Product from "../models/Product";
import { logActivity } from "./log.controller";

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product: productId, rating, comment } = req.body;
    // req.user exists because of protect middleware
    const userId = (req as any).user._id;

    // Check if user has bought this product and order is 'delivered'
    const hasBought = await Order.findOne({
      user: userId,
      status: "delivered",
      "items.product": productId
    });

    if (!hasBought) {
      res.status(400).json({ message: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận bánh thành công" });
      return;
    }

    // Check if already reviewed (optional depending on rules, let's allow 1 review per user per product)
    const exists = await Review.findOne({ product: productId, user: userId });
    if (exists) {
      res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này" });
      return;
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
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
    const userId = (req as any).user?._id;
    if (!userId) {
      res.json({ canReview: false }); return;
    }
    const productId = req.params.productId;
    const hasBought = await Order.findOne({
      user: userId,
      status: "delivered",
      "items.product": productId
    });
    
    if (!hasBought) {
      res.json({ canReview: false }); return;
    }

    const exists = await Review.findOne({ product: productId, user: userId });
    res.json({ canReview: !exists });
  } catch (err) {
    res.json({ canReview: false });
  }
}
