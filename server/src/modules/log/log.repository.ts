import ActivityLog, { IActivityLog } from "./log.model";

export const createLog = async (data: Partial<IActivityLog>) => {
  return ActivityLog.create(data);
};

export const getLogs = async () => {
  return ActivityLog.find({})
    .populate("admin", "name email role")
    .sort({ createdAt: -1 })
    .limit(100)
    .exec();
};
