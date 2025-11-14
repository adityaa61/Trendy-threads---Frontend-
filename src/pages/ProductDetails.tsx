import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { addToCart } from "@/Redux/slices/cartSlice";

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  images: ProductImage[];
  category?: string;
  gender?: string;
}

// ----------------------
// ✅ Component
// ----------------------
const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useAppDispatch();
  const { user, guestId } = useAppSelector((state) => state.auth);

  // ----------------------------
  // ✅ Fetch Product Details
  // ----------------------------
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);

        if (response.data?.images?.length > 0) {
          setMainImage(response.data.images[0].url);
        }

        // Fetch similar products
        if (response.data?.category) {
          const similarRes = await axios.get(
            `${API_URL}/api/products?category=${response.data.category}`
          );
          setSimilarProducts(
            similarRes.data.filter((p: Product) => p._id !== response.data._id)
          );
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ----------------------------
  // ✅ Quantity Controls
  // ----------------------------
  const handleQuantityChange = (action: "plus" | "minus") => {
    if (action === "plus") setQuantity((prev) => prev + 1);
    if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // ----------------------------
  // ✅ Add to Cart (Redux + API)
  // ----------------------------
  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedColor || !selectedSize) {
      toast.error("Please select a size and color before adding to cart");
      return;
    }

    const cartItem = {
      productId: product._id,
      quantity,
      size: selectedSize,
      color: selectedColor,
      userId: user?._id,
      guestId,
    };

    setIsButtonDisabled(true);

    dispatch(addToCart(cartItem))
      .unwrap()
      .then(() => {
        toast.success(`${product.name} added to cart!`);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to add item to cart");
      })
      .finally(() => setIsButtonDisabled(false));
  };

  // ----------------------------
  // ✅ Render
  // ----------------------------
  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-gray-600">Product not found</div>;
  }

  return (
    <div className="p-5">
      <div className="max-w-6xl mx-auto bg-white rounded-lg p-8">
        <div className="flex flex-col md:flex-row">
          {/* Left Thumbnails */}
          <div className="hidden md:flex flex-col space-y-4 mr-6">
            {product.images?.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.altText || `Thumbnail ${index}`}
                className={`w-20 h-20 border object-cover rounded-lg cursor-pointer ${
                  mainImage === image.url ? "border-black" : "border-gray-300"
                }`}
                onClick={() => setMainImage(image.url)}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="md:w-1/2">
            <img
              src={mainImage || ""}
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg mb-4"
            />
          </div>

          {/* Right Section */}
          <div className="md:w-1/2 md:ml-10">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>

            {product.originalPrice && (
              <p className="text-lg text-gray-500 line-through">
                ${product.originalPrice}
              </p>
            )}

            <p className="text-xl font-semibold text-gray-800 mb-2">
              ${product.price}
            </p>

            <p className="text-gray-600 mb-4">{product.description}</p>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-700">Color:</p>
                <div className="flex gap-2 mt-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === color
                          ? "border-4 border-black"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-700">Size:</p>
                <div className="flex gap-2 mt-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded ${
                        selectedSize === size
                          ? "bg-black text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Controls */}
            <div className="mb-6">
              <p className="text-gray-700">Quantity:</p>
              <div className="flex items-center space-x-4 mt-3">
                <button
                  onClick={() => handleQuantityChange("minus")}
                  className="px-2 py-1 bg-gray-200 rounded text-lg"
                >
                  -
                </button>
                <span className="text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("plus")}
                  className="px-2 py-1 bg-gray-200 rounded text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* ✅ Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={`bg-black text-white py-2 px-6 rounded w-full mb-4 ${
                isButtonDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-900"
              }`}
            >
              {isButtonDisabled ? "Adding..." : "ADD TO CART"}
            </button>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl text-center font-medium mb-4">
              You May Also Like
            </h2>
            <ProductGrid products={similarProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
