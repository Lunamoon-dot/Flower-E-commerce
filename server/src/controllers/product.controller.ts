import { Request, Response } from "express";
import Product from "../models/Product";
import { logActivity } from "./log.controller";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      category,
      search,
      sort,
      featured,
      page = "1",
      limit = "12",
    } = req.query;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.name = { $regex: search as string, $options: "i" };
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else if (sort === "rating") sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    res.status(500).json({ message });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch product";
    res.status(500).json({ message });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    await logActivity((req as any).user.id, "CREATE_PRODUCT", `Tạo sản phẩm mới: ${product.name}`, product._id.toString(), "Product");
    res.status(201).json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    res.status(500).json({ message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await logActivity((req as any).user.id, "UPDATE_PRODUCT", `Cập nhật sản phẩm: ${product.name}`, product._id.toString(), "Product");
    res.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    res.status(500).json({ message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await logActivity((req as any).user.id, "DELETE_PRODUCT", `Xóa sản phẩm: ${product.name}`, product._id.toString(), "Product");
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product";
    res.status(500).json({ message });
  }
};
