import { Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/auth";
import Voucher from "../models/Voucher";
import { logActivity } from "./log.controller";

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, deliveryDate, deliveryTime, voucherCode } = req.body;

    if (!deliveryDate || !deliveryTime) {
      res.status(400).json({ message: "Delivery date and time are required" });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({ message: "Order must have at least one item" });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ message: "Shipping address is required" });
      return;
    }

    const productIds = items.map(
      (item: { product: string }) => item.product
    );
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      res.status(400).json({ message: "One or more products not found" });
      return;
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.product
      );
      if (!product) {
        res
          .status(400)
          .json({ message: `Product ${item.product} not found` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
        return;
      }
      totalPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    let discountApplied = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
      if (voucher && new Date() >= voucher.startDate && new Date() <= voucher.endDate && voucher.usedCount < voucher.usageLimit && totalPrice >= voucher.minOrderValue) {
        if (voucher.type === "percent") {
          discountApplied = (totalPrice * voucher.value) / 100;
        } else {
          discountApplied = voucher.value;
        }
        voucher.usedCount += 1;
        await voucher.save();
      }
    }

    const order = await Order.create({
      user: req.user!.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      deliveryDate: new Date(deliveryDate),
      deliveryTime,
      totalPrice: Math.max(0, totalPrice - discountApplied), // Ensure non-negative
    });

    res.status(201).json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    res.status(500).json({ message });
  }
};

export const getUserOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!.id }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ message });
  }
};

export const getAllOrders = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ message });
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    ).populate("user", "name email");

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    await logActivity(req.user!.id, "UPDATE_ORDER_STATUS", `Cập nhật trạng thái đơn hàng #${order._id.toString().slice(-8)} thành ${status}`, order._id.toString(), "Order");

    res.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order";
    res.status(500).json({ message });
  }
};
