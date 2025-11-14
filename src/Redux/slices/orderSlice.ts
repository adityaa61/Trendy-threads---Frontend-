import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AxiosError } from "axios";

// ✅ Define types
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  [key: string]: any;
}

export interface OrderState {
  orders: Order[];
  totalOrders: number;
  orderDetails: Order | null;
  loading: boolean;
  error: string | null;
}

// ✅ Fetch user orders
export const fetchUserOrders = createAsyncThunk<
  Order[], // ✅ Return type
  void,    // ✅ Argument type
  { rejectValue: string } // ✅ Reject type
>("orders/fetchUserOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Order[]>(
      `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
  }
});

// ✅ Fetch order details by ID
export const fetchOrderDetails = createAsyncThunk<
  Order, // ✅ Return type
  { orderId: string }, // ✅ Argument type
  { rejectValue: string } // ✅ Reject type
>("orders/fetchOrderDetails", async ({ orderId }, { rejectWithValue }) => {
  try {
    const response = await axios.get<Order>(
      `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue(error.response?.data?.message || "Failed to fetch order details");
  }
});

// ✅ Initial state
const initialState: OrderState = {
  orders: [],
  totalOrders: 0,
  orderDetails: null,
  loading: false,
  error: null,
};

// ✅ Slice
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch all orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch user orders";
      })

      // 🔹 Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch order details";
      });
  },
});

export default orderSlice.reducer;
