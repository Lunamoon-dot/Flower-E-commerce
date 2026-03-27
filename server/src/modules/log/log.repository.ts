import ActivityLog, { IActivityLog } from "./log.model";

export const createLog = async (data: Partial<IActivityLog>) => {
  return ActivityLog.create(data);
};

export const getLogs = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return ActivityLog.find({})
    .populate("admin", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

export const countLogs = async () => {
  return ActivityLog.countDocuments();
};
