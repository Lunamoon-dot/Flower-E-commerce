import Voucher, { IVoucher } from "./voucher.model";

export const getVouchers = async () => {
  return Voucher.find({}).sort({ createdAt: -1 }).lean().exec();
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
