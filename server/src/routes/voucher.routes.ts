import { Router } from "express";
import { protect } from "../middleware/auth";
import { validateVoucher } from "../controllers/voucher.controller";

const router = Router();

// @route   POST /api/vouchers/validate
// @desc    Validate a voucher code
router.post("/validate", validateVoucher);

export default router;
