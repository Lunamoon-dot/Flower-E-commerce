import * as voucherRepository from "./voucher.repository";
import { sanitize } from "../../shared/utils/sanitizer";

export const getVouchers = async (page = 1, limit = 20) => {
  const [data, total] = await Promise.all([
    voucherRepository.getVouchers(page, limit),
    voucherRepository.countVouchers(),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getActiveVouchers = async () => {
  return voucherRepository.getActiveVouchers();
};

export const createVoucher = async (data: any) => {
  const { code, type, value, minOrderValue, startDate, endDate, usageLimit } = data;
  const upperCode = sanitize(code).toUpperCase();
  
  const exists = await voucherRepository.findVoucherByCode(upperCode);
  if (exists) {
    throw new Error("Mã giảm giá đã tồn tại!");
  }

  const voucher = await voucherRepository.createVoucher({
    code: upperCode, type, value, minOrderValue, startDate, endDate, usageLimit
  });
  
  return voucher;
};

export const updateVoucher = async (id: string, data: any) => {
  const voucher = await voucherRepository.getVoucherById(id);
  if (!voucher) {
    throw new Error("Voucher not found");
  }

  Object.assign(voucher, data);
  const updated = await voucher.save();
  return updated;
};

export const deleteVoucher = async (id: string) => {
  const voucher = await voucherRepository.deleteVoucherById(id);
  if (!voucher) {
    throw new Error("Voucher not found");
  }
  return voucher;
};

export const validateVoucher = async (code: string, orderValue: number) => {
  const voucher = await voucherRepository.findVoucherByCode(code.toUpperCase());

  if (!voucher) throw new Error("Voucher not found");
  if (!voucher.isActive) throw new Error("Voucher is inactive");

  const now = new Date();
  if (now < voucher.startDate || now > voucher.endDate) {
    throw new Error("Voucher is expired or not valid yet");
  }

  if (voucher.usedCount >= voucher.usageLimit) {
    throw new Error("Voucher usage limit reached");
  }

  if (orderValue < voucher.minOrderValue) {
    throw new Error(`Minimum order value is ${voucher.minOrderValue}`);
  }

  let discountAmount = 0;
  if (voucher.type === "percent") {
    discountAmount = (orderValue * voucher.value) / 100;
  } else if (voucher.type === "fixed") {
    discountAmount = voucher.value;
  } else if (voucher.type === "freeship") {
    discountAmount = voucher.value;
  }

  return { voucher, discountAmount };
};
