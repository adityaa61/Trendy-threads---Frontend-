import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import axios from "axios";

interface HeaderProps {
  onCartOpen: () => void;
  cartItemsCount: number;
}

const Header = ({ onCartOpen, cartItemsCount }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Check if logged-in user is admin
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === "admin") {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  }, []);

  const navLinks = [
    { to: "/men", label: "Men" },
    { to: "/women", label: "Women" },
    { to: "/kids", label: "Kids" },
    { to: "/beauty", label: "Beauty" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // ✅ Debounced Search Effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products?search=${searchTerm}`
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchResults, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSelectProduct = (id: string) => {
    setSearchTerm("");
    setSearchResults([]);
    navigate(`/product/${id}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="text-xl font-bold">
                  TrendyThreads
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        isActive(link.to)
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* ✅ Admin Link (Visible only for Admins) */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        isActive("/admin")
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>


          <Link to="/" className="flex items-center">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
              TrendyThreads
            </h1>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* ✅ Show Admin link only if user is admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* ✅ Desktop Search */}
          <div className="hidden lg:block relative flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Search Dropdown */}
            {searchTerm && (
              <div className="absolute w-full bg-card border rounded-md shadow-md mt-2 z-50 max-h-72 overflow-y-auto">
                {loading ? (
                  <p className="text-center text-sm py-3 text-muted-foreground">
                    Searching...
                  </p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectProduct(item._id)}
                      className="p-3 hover:bg-accent cursor-pointer transition-colors"
                    >
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm py-3 text-muted-foreground">
                    No products found
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              aria-label="Profile"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartOpen}
              className="relative h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-secondary text-secondary-foreground text-[10px] sm:text-xs flex items-center justify-center font-medium">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
