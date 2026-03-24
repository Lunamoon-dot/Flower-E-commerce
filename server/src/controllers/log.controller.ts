import { Request, Response } from "express";
import ActivityLog, { IActivityLog } from "../models/ActivityLog";
import { Types } from "mongoose";

// Helper for backend logic
export const logActivity = async (
  adminId: Types.ObjectId | string,
  action: string,
  description: string,
  targetId?: string,
  targetModel?: string
) => {
  try {
    await ActivityLog.create({
      admin: adminId,
      action,
      description,
      targetId,
      targetModel
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// @desc    Get all activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find({})
      .populate("admin", "name email role")
      .sort({ createdAt: -1 })
      .limit(100); // show only last 100 for performance
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
};
