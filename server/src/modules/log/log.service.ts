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

export const getLogs = async () => {
  return logRepository.getLogs();
};
