import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

import { errorMiddleware } from "./shared/middleware/error.middleware";

// ... existing app usage ...

app.use(errorMiddleware);

export default app;
