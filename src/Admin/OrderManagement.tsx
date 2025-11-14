import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/Redux/slices/adminOrderSlice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
  user: string | User;
  totalPrice: number;
  status: string;
}

const OrderManagement = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector(
    (state) => state.adminOrders
  ) as {
    orders: Order[];
    loading: boolean;
    error: string | null;
  };

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      toast.success("Order status updated successfully");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await dispatch(deleteOrder(id)).unwrap();
      toast.success("Order deleted successfully");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Order Management</h1>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>

        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              No orders available
            </p>
          ) : (
            // 🔥 MOBILE FRIENDLY TABLE WRAPPER
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] border-collapse text-sm text-left">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Total Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 text-gray-700 font-mono">
                        #{order._id.slice(-8)}
                      </td>

                      <td className="p-3">
                        {typeof order.user === "string"
                          ? order.user
                          : order.user?.name || "N/A"}
                      </td>

                      <td className="p-3">${order.totalPrice.toFixed(2)}</td>

                      <td className="p-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="border p-1 rounded w-full sm:w-auto"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-3 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
