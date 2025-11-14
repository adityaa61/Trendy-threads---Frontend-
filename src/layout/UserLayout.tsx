import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/Redux/hooks";
import {
  updateCartItemQuantity,
  fetchCart,
} from "@/Redux/slices/cartSlice";


const UserLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  const { user, guestId } = useAppSelector((s) => s.auth);
  const cartState = useAppSelector((s) => s.cart);
  const cartItems = cartState?.cart?.products || [];

  // ✅ Auto fetch cart on login / guest start
  useEffect(() => {
    if (user?._id || guestId) {
      dispatch(fetchCart({ userId: user?._id, guestId }));
    }
  }, [user?._id, guestId, dispatch]);

  // ✅ Allow opening cart globally
  useEffect(() => {
    const openCartListener = () => setIsCartOpen(true);
    window.addEventListener("open-cart", openCartListener);
    return () => window.removeEventListener("open-cart", openCartListener);
  }, []);

  // ✅ Quantity Update (+ / -)
  const handleUpdateQuantity = async (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    try {
      await dispatch(
        updateCartItemQuantity({
          productId,
          quantity,
          size,
          color,
          userId: user?._id,
          guestId,
        })
      ).unwrap();

      toast.success(
        quantity === 0 ? "Item removed from cart" : "Cart updated"
      );

      await dispatch(fetchCart({ userId: user?._id, guestId }));
    } catch (err: any) {
      console.error("Cart update error:", err);
      toast.error(err?.message || "Failed to update cart");
    }
  };

  // ✅ Checkout Navigation
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsCartOpen(false);
    toast.success("Proceeding to checkout...");
    await new Promise((res) => setTimeout(res, 300));
    navigate("/checkout");
  };

  // ✅ Total cart count for header badge
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onCartOpen={() => setIsCartOpen(true)}
        cartItemsCount={cartCount}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        {...({ items: cartItems } as any)} 
      />
    </div>
  );
};

export default UserLayout;
