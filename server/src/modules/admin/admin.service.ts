import Order from "../order/order.model";
import Product from "../product/product.model";
import User from "../auth/auth.model";

export const getDashboardStats = async () => {
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

  const totalRevenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const now = new Date();

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

  const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
    .select("name stock category")
    .sort({ stock: 1 })
    .limit(5)
    .lean();

  return {
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
  };
};

export const getAllUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
    User.countDocuments(),
  ]);

  return {
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateUserRole = async (id: string, role: string) => {
  return User.findByIdAndUpdate(id, { role }, { returnDocument: "after" }).select("-password").exec();
};

export const deleteUser = async (id: string) => {
  return User.findByIdAndDelete(id).exec();
};
