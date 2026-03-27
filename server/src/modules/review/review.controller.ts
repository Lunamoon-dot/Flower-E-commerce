import { Response, Request } from "express";
import * as reviewService from "./review.service";
import { logActivity } from "../log/log.service";
import { AuthRequest } from "../../shared/middleware/auth";

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const review = await reviewService.createReview(userId, req.body);
    res.status(201).json(review);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create review";
    res.status(400).json({ message });
  }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await reviewService.getProductReviews(req.params.id as string);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const reviews = await reviewService.getAllReviews(page, limit);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { updated, actionDesc, reviewId } = await reviewService.updateReview(req.params.id as string, req.body);
    
    await logActivity(req.user!.id, "UPDATE_REVIEW", actionDesc, reviewId, "Review");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review" });
  }
};

export const getReviewOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await reviewService.getReviewOrderDetails(req.params.id as string);
    res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order details";
    res.status(404).json({ message });
  }
};

export const canReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.json({ canReview: false }); return;
    }
    const result = await reviewService.canReview(userId, req.params.productId as string);
    res.json({ canReview: result });
  } catch (err) {
    res.json({ canReview: false });
  }
}

export const getReviewedProductIds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.json({ reviewedIds: [] }); return;
    }
    const reviewedIds = await reviewService.getReviewedProductIds(userId, req.body.productIds);
    res.json({ reviewedIds });
  } catch {
    res.json({ reviewedIds: [] });
  }
}
