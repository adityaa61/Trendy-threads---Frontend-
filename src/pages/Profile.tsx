import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector, useAppDispatch } from "@/Redux/hooks";
import { logout } from "@/Redux/slices/authSlice";

// ==========================
// Types
// ==========================
interface Order {
  id: string;
  created: string;
  shippingAddress: string;
  items: number;
  price: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
}

interface BackendOrder {
  _id: string;
  createdAt: string;
  shippingAddress?: { address?: string; city?: string };
  orderItems?: any[];
  totalPrice?: number;
  status?: string;
}

// ==========================
// Component
// ==========================
const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ✅ Read from Redux + LocalStorage fallback
  const { user: reduxUser } = useAppSelector((state) => state.auth);
  const storedUser = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string)
    : null;
  const user = reduxUser || storedUser;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Logout handler
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // ✅ Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("userToken") || localStorage.getItem("token");

        if (!token) {
          toast.error("You need to be logged in to view orders.");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedOrders: Order[] = (response.data as BackendOrder[]).map(
          (order) => ({
            id: order._id,
            created: new Date(order.createdAt).toLocaleDateString(),
            shippingAddress: `${order.shippingAddress?.address || ""}, ${
              order.shippingAddress?.city || ""
            }`,
            items: order.orderItems?.length || 0,
            price: order.totalPrice || 0,
            status:
              (order.status as Order["status"]) || ("Processing" as Order["status"]),
          })
        );

        setOrders(formattedOrders);
      } catch (error: any) {
        console.error("Error fetching orders:", error.response?.data || error.message);
        toast.error(
          error.response?.data?.message || "Failed to load your orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Badge variant by order status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Delivered":
        return "default";
      case "Shipped":
        return "secondary";
      case "Processing":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // ==========================
  // Render UI
  // ==========================
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  {user?.name || "Guest User"}
                </CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              size="sm"
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">My Orders</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">
                Loading your orders...
              </p>
            ) : orders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                You haven’t placed any orders yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Shipping Address</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.created}</TableCell>
                      <TableCell className="truncate max-w-xs">
                        {order.shippingAddress}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.items}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${order.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getStatusVariant(order.status)}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
