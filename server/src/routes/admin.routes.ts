import { Router } from "express";
import { protect, adminOnly, staffOnly, authorizeRoles } from "../middleware/auth";
import { uploadImage, upload } from "../controllers/upload.controller";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.controller";
import { getAllOrders, updateOrderStatus } from "../controllers/order.controller";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from "../controllers/voucher.controller";
import { getAllReviews, updateReview } from "../controllers/review.controller";
import { getLogs } from "../controllers/log.controller";

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
router.put("/orders/:id/status", staffOnly, updateOrderStatus);

// Products (full CRUD via admin route)
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

// Logs
router.get("/logs", authorizeRoles("superadmin", "admin"), getLogs);

export default router;
