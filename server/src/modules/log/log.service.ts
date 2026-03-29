import * as logRepository from "./log.repository";
import { Types } from "mongoose";

export const logActivity = async (
  adminId: Types.ObjectId | string,
  action: string,
  description: string,
  targetId?: string,
  targetModel?: string
) => {
  try {
    await logRepository.createLog({
      admin: adminId as any,
      action,
      description,
      targetId,
      targetModel
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getLogs = async (page = 1, limit = 20, date?: string) => {
  const query: any = {};
  
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }

  const [data, total] = await Promise.all([
    logRepository.getLogs(page, limit, query),
    logRepository.countLogs(query),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
