import { Router } from "express";
import { protect } from "../middleware/auth";
import { createReview, getProductReviews, canReview } from "../controllers/review.controller";

const router = Router();

router.get("/product/:id", getProductReviews);
router.post("/", protect, createReview);
router.get("/can-review/:productId", protect, canReview);

export default router;
