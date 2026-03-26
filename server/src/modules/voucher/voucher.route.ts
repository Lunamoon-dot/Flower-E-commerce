import { Router } from "express";
import { protect, adminOnly, staffOnly } from "../../shared/middleware/auth";
import { validateVoucher, getVouchers, createVoucher, updateVoucher, deleteVoucher } from "./voucher.controller";

const router = Router();

router.post("/validate", protect, validateVoucher); // Users can validate

// Admin routes will be integrated in Admin module or mounted here directly
// This route file may just be for public / user facing endpoints
// I will just add the /admin routes here as well for now or let admin routes use it
// In index.js, app.use("/api/vouchers", voucherRoutes) is used

router.get("/admin", protect, staffOnly, getVouchers);
router.post("/admin", protect, staffOnly, createVoucher);
router.put("/admin/:id", protect, staffOnly, updateVoucher);
router.delete("/admin/:id", protect, adminOnly, deleteVoucher);

export default router;
