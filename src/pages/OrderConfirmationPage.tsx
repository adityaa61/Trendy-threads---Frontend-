import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrderItem {
  name: string;
  color: string;
  size: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  orderItems: OrderItem[];
}

const OrderConfirmationPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");

        if (!token) {
          toast.error("Please log in to view your order");
          navigate("/login");
          return;
        }

        if (!orderId) {
          toast.error("No order ID found");
          navigate("/");
          return;
        }

        toast.loading("Verifying payment and fetching order...");

        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(data);
        toast.dismiss();
        toast.success("Payment verified successfully!");
      } catch (error) {
        console.error("Order fetch error:", error);
        toast.dismiss();
        toast.error("Failed to load order details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [navigate, orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Verifying your payment and preparing order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        No order found
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB");
  const estimatedDelivery = new Date(
    new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 10)
  ).toLocaleDateString("en-GB");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Card className="bg-white shadow-md rounded-lg w-full max-w-2xl p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-green-800 text-center mb-6">
          🎉 Thank You for Your Order!
        </h1>

        {/* Order Info */}
        <div className="flex justify-between text-gray-600 text-sm mb-6">
          <div>
            <p className="font-semibold text-black">Order ID: {order._id}</p>
            <p>Order Date: {orderDate}</p>
          </div>
          <p className="text-right text-sm sm:text-base">
            <span className="font-semibold text-gray-800">
              Estimated Delivery:
            </span>{" "}
            {estimatedDelivery}
          </p>
        </div>

        {/* Product List */}
        <div className="divide-y">
          {order.orderItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-md object-cover border"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.color} | {item.size}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{item.price}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment + Delivery */}
        <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Payment</p>
            <p>{order.paymentMethod}</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="font-semibold text-gray-800 mb-1">Delivery Address</p>
            <p className="max-w-[200px]">
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.country}
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="border-t mt-6 pt-4 text-right">
          <p className="font-semibold text-lg text-gray-800">
            Total: ₹{order.totalPrice.toFixed(2)}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;
