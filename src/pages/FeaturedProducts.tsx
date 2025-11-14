import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "../types/Product";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { addToCart } from "@/Redux/slices/cartSlice";

// ✅ Add this interface
interface FeaturedProductsProps {
  onAddToCart?: (product: Product) => void;
}

// ✅ Accept the prop here
const FeaturedProducts = ({ onAddToCart }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  const { user, guestId } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/featured`
        );
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // ✅ Use passed handler if available, otherwise local
  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    const cartItem = {
      productId: product._id,
      quantity: 1,
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0] || "default",
      userId: user?._id,
      guestId,
    };

    dispatch(addToCart(cartItem))
      .unwrap()
      .then(() => {
        toast.success(`${product.name} added to cart!`);
        window.dispatchEvent(new Event("open-cart"));
      })
      .catch(() => toast.error("Failed to add item to cart"));
  };

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
        <Button variant="ghost" asChild className="hidden sm:flex">
          <Link to="/men">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">
          Loading featured products...
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 py-8">
              No featured products available.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
