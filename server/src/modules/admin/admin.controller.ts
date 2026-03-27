import { Response } from "express";
import * as adminService from "./admin.service";
import { AuthRequest } from "../../shared/middleware/auth";
import { logActivity } from "../log/log.service";

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await adminService.getDashboardStats();
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get stats";
    res.status(500).json({ message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await adminService.getAllUsers(page, limit);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    res.status(500).json({ message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!["user", "admin", "superadmin", "salestaff"].includes(role)) {
      res.status(400).json({ message: "Role must be 'user', 'admin', 'superadmin', or 'salestaff'" });
      return;
    }
    const user = await adminService.updateUserRole(req.params.id as string, role);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    await logActivity(req.user!.id, "UPDATE_USER_ROLE", `Cập nhật quyền cho user ${user.name} thành ${role}`, user._id.toString(), "User");
    
    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    res.status(500).json({ message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.deleteUser(req.params.id as string);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await logActivity(req.user!.id, "DELETE_USER", `Xóa user ${user.name}`, user._id.toString(), "User");

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    res.status(500).json({ message });
  }
};
