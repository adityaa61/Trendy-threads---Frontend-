// src/Redux/slices/productSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// ---------- Product Image Type ----------
export interface ProductImage {
  url: string;
  altText?: string;
}

// ---------- Product Type ----------
export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images?: ProductImage[];   // ✅ Matches backend and ProductCard
  sizes?: string[];
  colors?: string[];
  brand?: string;
  category?: string;
  material?: string;
  gender?: string;
  image?: string;            // ✅ fallback for single image APIs
  [key: string]: any;
}

// ---------- Filters ----------
export interface ProductFilters {
  category?: string;
  size?: string;
  color?: string;
  gender?: string;
  brand?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  limit?: string | number;
  sortBy?: string;
  search?: string;
  material?: string;
  collection?: string;
}

// ---------- State ----------
export interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  similiarProducts: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

// ---------- Thunks ----------

// ✅ Fetch filtered products
export const fetchProductsByFilter = createAsyncThunk<
  Product[],
  ProductFilters,
  { rejectValue: string }
>("products/fetchByFilters", async (filters, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });

    const response = await axios.get<Product[]>(
      `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch products"
    );
  }
});

// ✅ Fetch single product details
export const fetchProductDetails = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>("products/fetchProductDetails", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<Product>(
      `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch product details"
    );
  }
});

// ---------- Slice ----------
const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  similiarProducts: [],
  loading: false,
  error: null,
  filters: {},
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProductsByFilter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchProductsByFilter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      // Fetch single product
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product details";
      });
  },
});

export const { setFilter, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
