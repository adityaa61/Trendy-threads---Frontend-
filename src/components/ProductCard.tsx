import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router-dom";
import type { Product } from "../types/Product"; // ✅ Use backend type, not mock data

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}




const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const imageUrl =
    product.images?.[0]?.url || // ✅ from backend
    product.images || // fallback for old mock data
    "https://via.placeholder.com/400x500?text=No+Image"; // placeholder

  const altText = product.images?.[0]?.altText || product.name || "Product";

  return (
    <Link to={`/product/${product._id}`} className="block"> {/* ✅ use _id from MongoDB */}
      <Card className="group overflow-hidden border transition-all hover:shadow-lg h-full flex flex-col">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={altText}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
          <div className="space-y-1 sm:space-y-2 flex-1">
            <h3 className="font-medium line-clamp-1 text-sm sm:text-base">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {product.brand}
            </p>
            <div className="flex items-center justify-between pt-1 sm:pt-2">
              <span className="text-base sm:text-lg font-bold">
                ${product.price}
              </span>
              <Button
                size="sm"
                onClick={() => onAddToCart(product)}
                className="gap-1 h-8 sm:h-9 text-xs sm:text-sm"
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
