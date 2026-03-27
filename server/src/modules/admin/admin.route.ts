import { Router } from "express";
import { protect, authorizeRoles, staffOnly, adminOnly } from "../../shared/middleware/auth";

import { uploadImage, upload } from "../upload/upload.controller";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "./admin.controller";
import { getAllOrders, updateOrderStatus, getOrderById } from "../order/order.controller";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../product/product.controller";
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from "../voucher/voucher.controller";
import { getAllReviews, updateReview, getReviewOrderDetails } from "../review/review.controller";
import { getLogs } from "../log/log.controller";

const router = Router();

// Base protect for all admin routes
router.use(protect);

// Dashboard
router.get("/dashboard", staffOnly, getDashboardStats);

// Image upload
router.post("/upload", staffOnly, upload.single("image"), uploadImage);

// Users
router.get("/users", authorizeRoles("superadmin", "admin"), getAllUsers);
router.put("/users/:id/role", authorizeRoles("superadmin", "admin"), updateUserRole);
router.delete("/users/:id", authorizeRoles("superadmin"), deleteUser);

// Orders
router.get("/orders", staffOnly, getAllOrders);
router.get("/orders/:id", staffOnly, getOrderById);
router.put("/orders/:id/status", staffOnly, updateOrderStatus);

// Products
router.get("/products", staffOnly, getProducts);
router.post("/products", staffOnly, createProduct);
router.put("/products/:id", staffOnly, updateProduct);
router.delete("/products/:id", authorizeRoles("superadmin", "admin"), deleteProduct);

// Vouchers
router.get("/vouchers", adminOnly, getVouchers);
router.post("/vouchers", adminOnly, createVoucher);
router.put("/vouchers/:id", adminOnly, updateVoucher);
router.delete("/vouchers/:id", adminOnly, deleteVoucher);

// Reviews
router.get("/reviews", adminOnly, getAllReviews);
router.put("/reviews/:id", adminOnly, updateReview);
router.get("/reviews/:id/order", adminOnly, getReviewOrderDetails);

// Logs
router.get("/logs", authorizeRoles("superadmin", "admin"), getLogs);

export default router;
