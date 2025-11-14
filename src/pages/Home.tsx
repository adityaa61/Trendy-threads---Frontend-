import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FeaturedProducts from "./FeaturedProducts";
import type { Product } from "../types/Product";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { addToCart } from "@/Redux/slices/cartSlice";

const Home = () => {
  const dispatch = useAppDispatch();
  const { user, guestId } = useAppSelector((state) => state.auth);

  // ✅ Add-to-cart handler connected to Redux
  const handleAddToCart = (product: Product) => {
    const cartItem = {
      productId: product._id,
      quantity: 1,
      size: product.sizes?.[0] || "M", // default size if available
      color: product.colors?.[0] || "default",
      userId: user?._id,
      guestId,
    };

    dispatch(addToCart(cartItem))
      .unwrap()
      .then(() => {
        toast.success(`${product.name} added to cart!`);
        // 🔽 auto open the CartDrawer
        window.dispatchEvent(new Event("open-cart"));
      })
      .catch(() => {
        toast.error("Failed to add item to cart");
      });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Elevate Your Style
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
              Discover the latest trends in fashion and lifestyle. Premium
              quality, timeless designs.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="text-sm sm:text-base">
                <Link to="/women">
                  Shop Women
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-sm sm:text-base"
              >
                <Link to="/men">Shop Men</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              name: "Men",
              link: "/men",
              image:
                "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=500&fit=crop",
            },
            {
              name: "Women",
              link: "/women",
              image:
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
            },
            {
              name: "Kids",
              link: "/kids",
              image:
                "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop",
            },
            {
              name: "Beauty",
              link: "/beauty",
              image:
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop",
            },
          ].map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group relative h-48 sm:h-56 lg:h-64 overflow-hidden rounded-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 sm:p-6">
                <h3 className="text-white text-xl sm:text-2xl font-bold">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
       
        <FeaturedProducts onAddToCart={handleAddToCart} />
      </section>

      {/* Promo Banner */}
      <section className="bg-secondary text-secondary-foreground py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            New Season, New Style
          </h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90">
            Get 20% off on your first order. Use code: WELCOME20
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-[#D29779] hover:text-white"
          >
            <Link to="/men">Shop Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
