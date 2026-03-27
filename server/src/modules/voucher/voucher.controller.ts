import { Request, Response } from "express";
import * as voucherService from "./voucher.service";
import { logActivity } from "../log/log.service";
import { AuthRequest } from "../../shared/middleware/auth";

export const getVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const vouchers = await voucherService.getVouchers(page, limit);
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Server error handling vouchers" });
  }
};

export const createVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const voucher = await voucherService.createVoucher(req.body);
    await logActivity(req.user!.id, "CREATE_VOUCHER", `Tạo mã giảm giá mới: ${voucher.code}`, voucher._id.toString(), "Voucher");
    res.status(201).json(voucher);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create voucher" });
  }
};

export const updateVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const voucher = await voucherService.updateVoucher(req.params.id as string, req.body);
    await logActivity(req.user!.id, "UPDATE_VOUCHER", `Cập nhật mã giảm giá: ${voucher.code}`, voucher._id.toString(), "Voucher");
    res.json(voucher);
  } catch (error: any) {
    res.status(404).json({ message: error.message || "Failed to update voucher" });
  }
};

export const deleteVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const voucher = await voucherService.deleteVoucher(req.params.id as string);
    await logActivity(req.user!.id, "DELETE_VOUCHER", `Xóa mã giảm giá: ${voucher.code}`, voucher._id.toString(), "Voucher");
    res.json({ message: "Voucher deleted" });
  } catch (error: any) {
    res.status(404).json({ message: error.message || "Failed to delete voucher" });
  }
};

export const validateVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderValue } = req.body;
    const result = await voucherService.validateVoucher(code, orderValue);
    res.json(result);
  } catch (error: any) {
    const status = error.message === "Voucher not found" ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};
