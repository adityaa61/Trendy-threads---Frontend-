import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { fetchAdminProducts, updateProduct } from "@/Redux/slices/adminProductSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  countInStock: number;
  sku: string;
  sizes: string[];
  colors: string[];
  images: { url: string }[];
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.adminProducts);

  const [product, setProduct] = useState<Product | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch products initially
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchAdminProducts());
    }
  }, [dispatch]);

  // Set selected product when loaded
  useEffect(() => {
    const found = products.find((p) => p._id === id);
    if (found) {
      setProduct({
        _id: found._id,
        name: found.name,
        description: found.description,
        price: found.price,
        countInStock: found.countInStock,
        sku: found.sku,
        sizes: found.sizes || [],
        colors: found.colors || [],
        images: found.images || [],
      });
    }
  }, [products, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!product) return;
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const uploadImageToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("userToken");

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.imageUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    setPreviewUrl(URL.createObjectURL(file));
    setNewImage(file);
  };

  const handleUpdate = async () => {
    if (!product) return;

    try {
      let uploadedImageUrl = null;

      if (newImage) {
        uploadedImageUrl = await uploadImageToServer(newImage);
      }

      const updatedData: any = {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        countInStock: Number(product.countInStock),
        sku: product.sku,
        sizes: product.sizes,
        colors: product.colors,
        images: uploadedImageUrl ? [{ url: uploadedImageUrl }] : product.images,
      };

      await dispatch(updateProduct({ id: product._id, productData: updatedData })).unwrap();

      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch {
      toast.error("Failed to update product");
    }
  };

  if (!product)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Edit Product</h1>

      {/* RESPONSIVE CARD */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Edit Product Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input name="name" value={product.name} onChange={handleChange} />

          <Textarea
            name="description"
            value={product.description}
            onChange={handleChange}
          />

          {/* PRICE + STOCK responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
            />
            <Input
              name="countInStock"
              type="number"
              value={product.countInStock}
              onChange={handleChange}
            />
          </div>

          <Input name="sku" value={product.sku} onChange={handleChange} />

          <Input
            name="sizes"
            value={product.sizes.join(", ")}
            onChange={(e) =>
              setProduct({
                ...product,
                sizes: e.target.value.split(",").map((s) => s.trim()),
              })
            }
          />

          <Input
            name="colors"
            value={product.colors.join(", ")}
            onChange={(e) =>
              setProduct({
                ...product,
                colors: e.target.value.split(",").map((c) => c.trim()),
              })
            }
          />

          {/* IMAGE UPLOAD */}
          <div>
            <label className="text-sm font-medium block mb-2">Upload Image</label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />

            {/* RESPONSIVE IMAGE PREVIEW */}
            <div className="flex flex-wrap gap-4 mt-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  className="w-24 h-24 rounded border object-cover"
                />
              ) : (
                product.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    className="w-24 h-24 rounded border object-cover"
                  />
                ))
              )}
            </div>
          </div>

          {/* FULL-WIDTH BUTTON */}
          <Button
            onClick={handleUpdate}
            className="w-full bg-green-600 text-white"
          >
            Update Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
