import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.post("/", protect, createOrder);
router.get("/user", protect, getUserOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
