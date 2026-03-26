import { Request, Response } from "express";
import * as logService from "./log.service";
import { Types } from "mongoose";

// Helper for backend logic
export const logActivity = async (
  adminId: Types.ObjectId | string,
  action: string,
  description: string,
  targetId?: string,
  targetModel?: string
) => {
  await logService.logActivity(adminId, action, description, targetId, targetModel);
};

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await logService.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
};
