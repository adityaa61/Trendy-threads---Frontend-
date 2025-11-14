import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import {
  fetchAdminProducts,
  deleteProduct,
} from "@/Redux/slices/adminProductSlice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ProductManagement = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state) => state.adminProducts
  );

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading products...
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
    <div className="flex min-h-screen bg-gray-50 w-full">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Product Management</h1>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>

          <CardContent>
            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                No products found
              </p>
            ) : (
              <>
                {/* ⭐ DESKTOP TABLE (unchanged) */}
                <div className="overflow-x-auto w-full hidden sm:block">
                  <table className="w-full min-w-[600px] border-collapse text-sm text-left">
                    <thead>
                      <tr className="border-b bg-gray-100">
                        <th className="p-3 font-semibold">Name</th>
                        <th className="p-3 font-semibold">Price</th>
                        <th className="p-3 font-semibold">Category</th>
                        <th className="p-3 font-semibold">Brand</th>
                        <th className="p-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product._id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-3 whitespace-nowrap">{product.name}</td>
                          <td className="p-3 whitespace-nowrap">
                            ₹{product.price.toFixed(2)}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {product.category || "N/A"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {product.brand || "N/A"}
                          </td>

                          <td className="p-3 flex justify-end gap-2 whitespace-nowrap">
                            <Link to={`/admin/edit-product/${product._id}`}>
                              <Button
                                size="sm"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                              >
                                Edit
                              </Button>
                            </Link>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ⭐ MOBILE CARD VIEW */}
                <div className="sm:hidden space-y-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="p-4 bg-white rounded-lg shadow border"
                    >
                      <p className="font-semibold text-lg">{product.name}</p>

                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p><b>Price:</b> ₹{product.price.toFixed(2)}</p>
                        <p><b>Category:</b> {product.category || "N/A"}</p>
                        <p><b>Brand:</b> {product.brand || "N/A"}</p>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Link to={`/admin/edit-product/${product._id}`}>
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            Edit
                          </Button>
                        </Link>

                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductManagement;
