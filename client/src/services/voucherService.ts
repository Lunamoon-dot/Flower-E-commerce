import api from "./api"
import type { Voucher } from "@/types"

export interface ValidationResult {
  voucher: Voucher
  discountAmount: number
}

export const voucherService = {
  validateVoucher: async (code: string, orderValue: number): Promise<ValidationResult> => {
    const { data } = await api.post("/vouchers/validate", { code, orderValue })
    return data
  }
}
