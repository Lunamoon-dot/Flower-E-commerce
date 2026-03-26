import { Request, Response } from "express";
import * as productService from "./product.service";
import { logActivity } from "../log/log.service";
import { AuthRequest } from "../../shared/middleware/auth";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productService.getProducts(req.query);
    // Return both products (old name) and data (new standard) for compatibility
    res.json({
      ...result,
      data: result.products
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    res.status(500).json({ message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id as string);
    res.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    res.status(404).json({ message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    await logActivity((req as AuthRequest).user!.id, "CREATE_PRODUCT", `Tạo sản phẩm mới: ${product.name}`, product._id.toString(), "Product");
    res.status(201).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    res.status(500).json({ message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    await logActivity((req as AuthRequest).user!.id, "UPDATE_PRODUCT", `Cập nhật sản phẩm: ${product.name}`, product._id.toString(), "Product");
    res.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    res.status(404).json({ message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.deleteProduct(req.params.id as string);
    await logActivity((req as AuthRequest).user!.id, "DELETE_PRODUCT", `Xóa sản phẩm: ${product.name}`, product._id.toString(), "Product");
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    res.status(404).json({ message });
  }
};
