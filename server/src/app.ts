import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Note: These imports will be updated in Phase 5 to point to src/modules
import authRoutes from "./modules/auth/auth.route";
import productRoutes from "./modules/product/product.route";
import orderRoutes from "./modules/order/order.route";
import adminRoutes from "./modules/admin/admin.route";
import voucherRoutes from "./modules/voucher/voucher.route";
import reviewRoutes from "./modules/review/review.route";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Server is running!" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
