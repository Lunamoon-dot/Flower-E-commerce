import Product, { IProduct } from "./product.model";

export const getProducts = async (filter: any, sortOption: any, skip: number, limitNum: number) => {
  return Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean().exec();
};

export const countProducts = async (filter: any) => {
  return Product.countDocuments(filter).exec();
};

export const getProductById = async (id: string) => {
  return Product.findById(id).lean().exec();
};

export const createProduct = async (data: any) => {
  return Product.create(data);
};

export const updateProduct = async (id: string, data: any) => {
  return Product.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true }).exec();
};

export const deleteProduct = async (id: string) => {
  return Product.findByIdAndDelete(id).exec();
};
