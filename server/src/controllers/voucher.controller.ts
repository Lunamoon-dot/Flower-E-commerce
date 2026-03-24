import { Request, Response } from "express";
import Voucher from "../models/Voucher";
import { logActivity } from "./log.controller";
import { AuthRequest } from "../middleware/auth";

// @desc    Get all vouchers
// @route   GET /api/admin/vouchers
// @access  Private/Admin
export const getVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Server error handling vouchers" });
  }
};

// @desc    Create a voucher
// @route   POST /api/admin/vouchers
// @access  Private/Admin
export const createVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, type, value, minOrderValue, startDate, endDate, usageLimit } = req.body;

    const upperCode = code.toUpperCase();
    const exists = await Voucher.findOne({ code: upperCode });
    if (exists) {
      res.status(400).json({ message: "Mã giảm giá đã tồn tại!" });
      return;
    }

    const voucher = await Voucher.create({
      code: upperCode, type, value, minOrderValue, startDate, endDate, usageLimit
    });
    
    await logActivity(req.user!.id, "CREATE_VOUCHER", `Tạo mã giảm giá mới: ${upperCode}`, voucher._id.toString(), "Voucher");
    
    res.status(201).json(voucher);
  } catch (error: any) {
    console.error("Voucher create error:", error);
    res.status(500).json({ message: error.message || "Failed to create voucher" });
  }
};

// @desc    Update a voucher
// @route   PUT /api/admin/vouchers/:id
// @access  Private/Admin
export const updateVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      res.status(404).json({ message: "Voucher not found" });
      return;
    }

    Object.assign(voucher, req.body);
    const updated = await voucher.save();
    
    await logActivity(req.user!.id, "UPDATE_VOUCHER", `Cập nhật mã giảm giá: ${voucher.code}`, voucher._id.toString(), "Voucher");
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update voucher" });
  }
};

// @desc    Delete a voucher
// @route   DELETE /api/admin/vouchers/:id
// @access  Private/Admin
export const deleteVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      res.status(404).json({ message: "Voucher not found" });
      return;
    }
    
    await logActivity(req.user!.id, "DELETE_VOUCHER", `Xóa mã giảm giá: ${voucher.code}`, voucher._id.toString(), "Voucher");
    
    res.json({ message: "Voucher deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete voucher" });
  }
};

// @desc    Validate/apply a voucher
// @route   POST /api/vouchers/validate
// @access  Private
export const validateVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderValue } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      res.status(404).json({ message: "Voucher not found" });
      return;
    }

    if (!voucher.isActive) {
      res.status(400).json({ message: "Voucher is inactive" });
      return;
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      res.status(400).json({ message: "Voucher is expired or not valid yet" });
      return;
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      res.status(400).json({ message: "Voucher usage limit reached" });
      return;
    }

    if (orderValue < voucher.minOrderValue) {
      res.status(400).json({ message: `Minimum order value is ${voucher.minOrderValue}` });
      return;
    }

    let discountAmount = 0;
    if (voucher.type === "percent") {
      discountAmount = (orderValue * voucher.value) / 100;
      // You can add max discount logic here
    } else if (voucher.type === "fixed") {
      discountAmount = voucher.value;
    } else if (voucher.type === "freeship") {
      discountAmount = voucher.value; // Assume value covers shipping fee
    }

    res.json({ voucher, discountAmount });
  } catch (error) {
    res.status(500).json({ message: "Failed to validate voucher" });
  }
};
