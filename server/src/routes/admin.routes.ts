import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
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

const router = Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Image upload
router.post("/upload", upload.single("image"), uploadImage);

// Users
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Products (full CRUD via admin route)
router.get("/products", getProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
