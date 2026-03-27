import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "./order.controller";
import { protect, adminOnly } from "../../shared/middleware/auth";

const router = Router();

router.post("/", protect, createOrder);
router.get("/user", protect, getUserOrders);

export default router;
