import * as orderRepository from "./order.repository";
import Product from "../product/product.model";
import Voucher from "../voucher/voucher.model";
import { sanitize } from "../../shared/utils/sanitizer";

export const createOrder = async (userId: string, data: any) => {
  const { items, shippingAddress, paymentMethod, deliveryDate, deliveryTime, voucherCode } = data;

  if (!deliveryDate || !deliveryTime) throw new Error("Delivery date and time are required");
  if (!items || items.length === 0) throw new Error("Order must have at least one item");
  if (!shippingAddress) throw new Error("Shipping address is required");

  const productIds = items.map((item: { product: string }) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== items.length) throw new Error("One or more products not found");

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
    
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
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
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

  const order = await orderRepository.createOrder({
    user: userId as any,
    items: orderItems,
    shippingAddress: {
      fullName: sanitize(shippingAddress.fullName),
      phone: sanitize(shippingAddress.phone),
      address: sanitize(shippingAddress.address),
      city: sanitize(shippingAddress.city),
      district: sanitize(shippingAddress.district),
      note: sanitize(shippingAddress.note),
    },
    paymentMethod: paymentMethod || "cod",
    deliveryDate: new Date(deliveryDate),
    deliveryTime: sanitize(deliveryTime),
    totalPrice: Math.max(0, totalPrice - discountApplied),
  });

  return order;
};

export const getUserOrders = async (userId: string) => {
  return orderRepository.getOrdersByUser(userId);
};

export const getAllOrders = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    orderRepository.getAllOrdersPaginated(skip, limit),
    orderRepository.countOrders(),
  ]);
  return {
    data: orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateOrderStatus = async (id: string, status: string) => {
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  const order = await orderRepository.updateOrderStatus(id, status);
  if (!order) throw new Error("Order not found");
  return order;
};

export const getOrderById = async (id: string) => {
  const order = await orderRepository.getOrderById(id);
  if (!order) throw new Error("Order not found");
  return order;
};
