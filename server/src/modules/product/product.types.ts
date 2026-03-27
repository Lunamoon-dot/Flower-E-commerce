export interface ProductQuery {
  category?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "rating" | "latest";
  featured?: string;
  page?: string;
  limit?: string;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image?: string;
  images?: string[];
  featured?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
