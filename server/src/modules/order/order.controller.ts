import { Response } from "express";
import * as orderService from "./order.service";
import { AuthRequest } from "../../shared/middleware/auth";
import { logActivity } from "../log/log.service";

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await orderService.createOrder(req.user!.id, req.body);
    res.status(201).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    res.status(400).json({ message });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await orderService.getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ message });
  }
};

export const getAllOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id as string, status);
    
    await logActivity(req.user!.id, "UPDATE_ORDER_STATUS", `Cập nhật trạng thái đơn hàng #${order._id.toString().slice(-8)} thành ${status}`, order._id.toString(), "Order");

    res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order";
    res.status(400).json({ message });
  }
};
