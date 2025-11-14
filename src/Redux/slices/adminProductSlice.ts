import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AxiosError } from "axios";

// ===============================
// 🔹 Types
// ===============================
interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  [key: string]: any; // allow extra dynamic fields if needed
}

interface ErrorResponse {
  message: string;
}

interface AdminProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ===============================
// 🔹 Async Thunks
// ===============================

// ✅ Fetch all admin products
export const fetchAdminProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: ErrorResponse }
>("adminProducts/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Product[]>(`${API_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to fetch products" });
  }
});

// ✅ Create a new product
export const createProduct = createAsyncThunk<
  Product,
  Record<string, any>,
  { rejectValue: ErrorResponse }
>("adminProducts/createProduct", async (productData, { rejectWithValue }) => {
  try {
    const response = await axios.post<Product>(
      `${API_URL}/api/admin/products`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to create product" });
  }
});

// ✅ Update a product
export const updateProduct = createAsyncThunk<
  Product,
  { id: string; productData: Partial<Product> },
  { rejectValue: ErrorResponse }
>("adminProducts/updateProduct", async ({ id, productData }, { rejectWithValue }) => {
  try {
    const response = await axios.put<Product>(
      `${API_URL}/api/admin/products/${id}`,
      productData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to update product" });
  }
});

// ✅ Delete a product
export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>("adminProducts/deleteProduct", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to delete product" });
  }
});

// ===============================
// 🔹 Slice
// ===============================
const initialState: AdminProductState = {
  products: [],
  loading: false,
  error: null,
};

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch products";
      });

    // Create Product
    builder
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to create product";
      });

    // Update Product
    builder.addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    });

    // Delete Product
    builder.addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
    });
  },
});

export default adminProductSlice.reducer;
