import { X, Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { updateCartItemQuantity, removeFromCart } from "@/Redux/slices/cartSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, guestId } = useAppSelector((s) => s.auth); // ✅ Include guest & user
  const { cart, loading } = useAppSelector((s) => s.cart);
  const items = cart?.products || [];

  const total = Array.isArray(items)
    ? items.reduce((sum, it) => sum + ((it.price ?? 0) * (it.quantity ?? 0)), 0)
    : 0;

  if (!isOpen) return null;

  // ✅ Handle Decrease
  const handleDecrease = async (item: any) => {
    const newQty = Math.max(0, (item.quantity ?? 0) - 1);

    if (newQty === 0) {
      try {
        await dispatch(
          removeFromCart({
            productId: item.productId,
            size: item.size,
            color: item.color,
            userId: user?._id,
            guestId,
          })
        ).unwrap();
        toast.info(`${item.name} removed from cart`);
      } catch {
        toast.error("Failed to remove item");
      }
      return;
    }

    try {
      await dispatch(
        updateCartItemQuantity({
          productId: item.productId,
          quantity: newQty,
          size: item.size,
          color: item.color,
          userId: user?._id,
          guestId,
        })
      ).unwrap();
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  // ✅ Handle Increase
  const handleIncrease = async (item: any) => {
    try {
      await dispatch(
        updateCartItemQuantity({
          productId: item.productId,
          quantity: (item.quantity ?? 0) + 1,
          size: item.size,
          color: item.color,
          userId: user?._id,
          guestId,
        })
      ).unwrap();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  // ✅ Checkout button handler
  const handleCheckoutClick = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l shadow-2xl z-50 animate-slide-in-right">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={loading}
                            onClick={() => handleDecrease(item)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={loading}
                            onClick={() => handleIncrease(item)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold">
                          ₹{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckoutClick}
                disabled={loading}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
