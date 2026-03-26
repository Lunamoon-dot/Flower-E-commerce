import { Router } from "express";
import { protect } from "../../shared/middleware/auth";
import { createReview, getProductReviews, canReview, getReviewedProductIds } from "./review.controller";

const router = Router();

router.get("/product/:id", getProductReviews);
router.post("/", protect, createReview);
router.get("/can-review/:productId", protect, canReview);
router.post("/reviewed-products", protect, getReviewedProductIds);

export default router;
