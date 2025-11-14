import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Order {
  _id: string;
  user: { name: string } | string | null;
  totalPrice: number;
  paymentStatus?: string;
  status?: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) {
        console.warn("⚠️ No token found — admin not logged in");
        return;
      }

      if (!refreshing) setLoading(true);
      else setRefreshing(true);

      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allOrders: Order[] = ordersRes.data || [];
      const products = productsRes.data || [];

      setOrders(allOrders);
      setTotalProducts(products.length);

      const totalRev = allOrders.reduce(
        (sum, order) => sum + (Number(order.totalPrice) || 0),
        0
      );
      setRevenue(totalRev);
    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>

        <Button
          onClick={fetchDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading dashboard...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-3xl font-bold text-green-600">
                  ${revenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total revenue from all orders
                </p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-3xl font-bold">
                  {orders.length}
                </p>
                <Link
                  to="/admin/orders"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Manage Orders
                </Link>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-3xl font-bold">
                  {totalProducts}
                </p>
                <Link
                  to="/admin/products"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Manage Products
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Recent Orders
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* TABLE SCROLL FOR MOBILE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="p-2 font-semibold">Order ID</th>
                      <th className="p-2 font-semibold">Customer</th>
                      <th className="p-2 font-semibold">Total</th>
                      <th className="p-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-gray-500"
                        >
                          No recent orders
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr
                          key={order._id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-2 text-gray-700 font-mono">
                            {order._id.slice(-8)}
                          </td>
                          <td className="p-2">
                            {typeof order.user === "string"
                              ? order.user
                              : order.user?.name || "Guest"}
                          </td>
                          <td className="p-2">
                            ${Number(order.totalPrice || 0).toFixed(2)}
                          </td>
                          <td className="p-2">
                            <span
                              className={`font-medium ${
                                order.status === "Delivered"
                                  ? "text-green-600"
                                  : order.status === "Cancelled"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {order.status || "Processing"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
