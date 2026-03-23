import { Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

// GET /api/admin/dashboard – overview stats + chart data
export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      allOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().select("totalPrice createdAt status").lean(),
    ]);

    // Total revenue (delivered + processing + shipped only, exclude cancelled)
    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const now = new Date();

    // Revenue by day (last 14 days)
    const revenueByDay: { day: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;

      const dayOrders = allOrders.filter((o) => {
        const created = new Date(o.createdAt);
        return created >= start && created <= end && o.status !== "cancelled";
      });

      revenueByDay.push({
        day: label,
        revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
        orders: dayOrders.length,
      });
    }

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = `${d.getMonth() + 1}/${d.getFullYear()}`;

      const monthOrders = allOrders.filter((o) => {
        const created = new Date(o.createdAt);
        return created >= start && created <= end && o.status !== "cancelled";
      });

      revenueByMonth.push({
        month: label,
        revenue: monthOrders.reduce((s, o) => s + o.totalPrice, 0),
        orders: monthOrders.length,
      });
    }

    // Order status distribution
    const statusCounts: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    allOrders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    });

    const orderStatusData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // Low stock products (stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select("name stock category")
      .sort({ stock: 1 })
      .limit(5)
      .lean();

    res.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
      },
      revenueByDay,
      revenueByMonth,
      orderStatusData,
      lowStockProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get stats";
    res.status(500).json({ message });
  }
};

// GET /api/admin/users – list all users
export const getAllUsers = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    res.status(500).json({ message });
  }
};

// PUT /api/admin/users/:id/role – change user role
export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      res.status(400).json({ message: "Role must be 'user' or 'admin'" });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    res.status(500).json({ message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    res.status(500).json({ message });
  }
};
