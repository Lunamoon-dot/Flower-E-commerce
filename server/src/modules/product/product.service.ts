import * as productRepository from "./product.repository";
import { ProductQuery, CreateProductDTO, UpdateProductDTO } from "./product.types";
import { AppError } from "../../shared/utils/appError";
import { sanitize } from "../../shared/utils/sanitizer";

export const getProducts = async (query: ProductQuery) => {
  const { category, search, sort, featured, page = "1", limit = "12" } = query;

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

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    productRepository.getProducts(filter, sortOption, skip, limitNum),
    productRepository.countProducts(filter),
  ]);

  return { 
    data: products, // Standardized field name
    products, // Keep for backward compatibility for now
    page: pageNum, 
    totalPages: Math.ceil(total / limitNum), 
    total 
  };
};

export const getProductById = async (id: string) => {
  const product = await productRepository.getProductById(id);
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

export const createProduct = async (data: CreateProductDTO) => {
  const sanitized = {
    ...data,
    name: sanitize(data.name),
    description: sanitize(data.description),
    category: sanitize(data.category)
  };
  return await productRepository.createProduct(sanitized);
};

export const updateProduct = async (id: string, data: UpdateProductDTO) => {
  const sanitized = { ...data };
  if (data.name) sanitized.name = sanitize(data.name);
  if (data.description) sanitized.description = sanitize(data.description);
  if (data.category) sanitized.category = sanitize(data.category);
  
  const product = await productRepository.updateProduct(id, sanitized);
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await productRepository.deleteProduct(id);
  if (!product) throw new AppError("Product not found", 404);
  return product;
};
