import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Package, ShoppingBag, Users, Home, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path
      ? "bg-gray-800 text-white"
      : "hover:bg-gray-800 text-gray-300";

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    sessionStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* 🔹 MOBILE NAVBAR ONLY — DESKTOP UNCHANGED */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-gray-900 text-white 
          flex items-center justify-between px-4 py-4 z-50 shadow-md">

        <h2 className="text-xl font-bold truncate max-w-[70%]">
          Trendy Threads
        </h2>

        <button
          onClick={() => setOpen(!open)}
          className="text-white bg-gray-800 p-2 rounded-md"
        >
          {open ? <X size={22} /> : (
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-white"></span>
              <span className="block w-5 h-0.5 bg-white"></span>
              <span className="block w-5 h-0.5 bg-white"></span>
            </div>
          )}
        </button>
      </div>

      {/* 🔹 MOBILE BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        ></div>
      )}

      {/* 🔹 SIDEBAR — DESKTOP SAME, MOBILE SLIDING */}
      <aside
        className={`
          w-64 bg-gray-900 text-white flex flex-col justify-between
          h-full lg:h-auto                         /* desktop same */
          fixed lg:static z-40 shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div>
          <h2 className="text-2xl font-bold p-6 border-b border-gray-800 hidden lg:block">
            Trendy Threads
          </h2>

          <nav className="p-4 flex flex-col gap-3 mt-20 lg:mt-0">
            <Link
              to="/admin"
              className={`flex items-center gap-2 p-2 rounded ${isActive("/admin")}`}
              onClick={() => setOpen(false)}
            >
              <Home className="w-4 h-4" /> Dashboard
            </Link>

            <Link
              to="/admin/users"
              className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/users")}`}
              onClick={() => setOpen(false)}
            >
              <Users className="w-4 h-4" /> Users
            </Link>

            <Link
              to="/admin/products"
              className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/products")}`}
              onClick={() => setOpen(false)}
            >
              <Package className="w-4 h-4" /> Products
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/orders")}`}
              onClick={() => setOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" /> Orders
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors"
              onClick={() => setOpen(false)}
            >
              🛍️ Shop
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* 🔹 MAIN CONTENT — DESKTOP SAME AS ORIGINAL */}
      <main className="flex-1 p-8 overflow-auto mt-20 lg:mt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
