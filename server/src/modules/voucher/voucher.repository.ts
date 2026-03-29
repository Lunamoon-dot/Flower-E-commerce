import Voucher, { IVoucher } from "./voucher.model";

export const getVouchers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return Voucher.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

export const countVouchers = async () => {
  return Voucher.countDocuments();
};

export const getActiveVouchers = async () => {
  const now = new Date();
  return Voucher.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $expr: { $lt: ["$usedCount", "$usageLimit"] }
  })
    .sort({ value: -1 })
    .lean()
    .exec();
};

export const findVoucherByCode = async (code: string) => {
  return Voucher.findOne({ code }).lean().exec();
};

export const createVoucher = async (data: Partial<IVoucher>) => {
  return Voucher.create(data);
};

export const getVoucherById = async (id: string) => {
  return Voucher.findById(id).lean().exec();
};

export const deleteVoucherById = async (id: string) => {
  return Voucher.findByIdAndDelete(id).exec();
};
