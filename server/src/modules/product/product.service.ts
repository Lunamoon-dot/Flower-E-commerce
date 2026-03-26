import * as productRepository from "./product.repository";

export const getProducts = async (query: any) => {
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

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    productRepository.getProducts(filter, sortOption, skip, limitNum),
    productRepository.countProducts(filter),
  ]);

  return { products, page: pageNum, totalPages: Math.ceil(total / limitNum), total };
};

export const getProductById = async (id: string) => {
  const product = await productRepository.getProductById(id);
  if (!product) throw new Error("Product not found");
  return product;
};

export const createProduct = async (data: any) => {
  return await productRepository.createProduct(data);
};

export const updateProduct = async (id: string, data: any) => {
  const product = await productRepository.updateProduct(id, data);
  if (!product) throw new Error("Product not found");
  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await productRepository.deleteProduct(id);
  if (!product) throw new Error("Product not found");
  return product;
};
