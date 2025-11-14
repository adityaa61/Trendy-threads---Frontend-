export interface ProductImage {
  url: string;
  altText?: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  countInStock?: number;
  sku?: string;
  category: string;
  brand?: string;
  sizes: string[];
  colors: string[];
  collections?: string;
  material?: string;
  gender?: "Men" | "Women" | "Unisex" | "Kids";
  images: ProductImage;
  isFeatured?: boolean;
  isPublished?: boolean;
  rating?: number;
  numReviews?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensions?: ProductDimensions;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}
