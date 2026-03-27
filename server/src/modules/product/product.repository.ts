import Product, { IProduct } from "./product.model";
import { CreateProductDTO, UpdateProductDTO } from "./product.types";

export const getProducts = async (filter: Record<string, unknown>, sortOption: Record<string, 1 | -1>, skip: number, limitNum: number) => {
  return Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean().exec();
};

export const countProducts = async (filter: Record<string, unknown>) => {
  return Product.countDocuments(filter).exec();
};

export const getProductById = async (id: string) => {
  return Product.findById(id).lean().exec();
};

export const createProduct = async (data: CreateProductDTO) => {
  return Product.create(data);
};

export const updateProduct = async (id: string, data: UpdateProductDTO) => {
  return Product.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true }).exec();
};

export const deleteProduct = async (id: string) => {
  return Product.findByIdAndDelete(id).exec();
};
