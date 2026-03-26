import Order, { IOrder } from "./order.model";

export const createOrder = async (orderData: Partial<IOrder>) => {
  return Order.create(orderData);
};

export const getOrdersByUser = async (userId: string) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean().exec();
};

export const getAllOrders = async () => {
  return Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean().exec();
};

export const updateOrderStatus = async (id: string, status: string) => {
  return Order.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).populate("user", "name email").exec();
};
