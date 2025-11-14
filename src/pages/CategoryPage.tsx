import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar, { Filters } from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { Product } from "../types/Product";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import { addToCart } from "@/Redux/slices/cartSlice";

interface CategoryPageProps {
  category: string;
  title: string;
  gender: string;
}

const CategoryPage = ({ gender, title }: CategoryPageProps) => {
  const dispatch = useAppDispatch();
  const { user, guestId } = useAppSelector((state) => state.auth);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    genders: [gender],
    colors: [],
    sizes: [],
    materials: [],
    brands: [],
    priceRange: [0, 200],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products?gender=${gender}`
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

    fetchProducts();
  }, [gender]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.genders.length > 0 && !filters.genders.includes(product.gender)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
      if (filters.colors.length > 0 && !product.colors.some((c) => filters.colors.includes(c))) return false;
      if (filters.sizes.length > 0 && !product.sizes.some((s) => filters.sizes.includes(s))) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(product.material)) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      return true;
    });
  }, [products, filters]);

  // ✅ Fixed handler
  const handleAddToCart = (product: Product) => {
  const productData = {
    productId: product._id,
    quantity: 1,
    size:  "M", // if size exists
    color:  "Default",
    userId: user?._id, // ✅ include if logged in
    guestId,           // ✅ include for guest users
  };

  dispatch(addToCart(productData))
    .unwrap()
    .then(() => toast.success(`Added ${product.name} to cart!`))
    .catch((err) => {
      toast.error(err || "Failed to add item to cart");
    });
};


  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:block">
        <FilterSidebar filters={filters} onFilterChange={setFilters} availableGenders={[gender]} />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{title}</h1>

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96">
                <SheetTitle className="sr-only">Filter Products</SheetTitle>
                <FilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  availableGenders={[gender]}
                  isMobile
                />
              </SheetContent>
            </Sheet>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground">
            {loading ? "Loading..." : `${filteredProducts.length} products found`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20 text-muted-foreground">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-muted-foreground">
            No products match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
