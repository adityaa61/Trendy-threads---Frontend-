import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AxiosError } from "axios";

// ===============================
// 🔹 Types
// ===============================

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // allow extra fields if needed
}

interface ErrorResponse {
  message: string;
}

interface AdminOrderState {
  orders: Order[];
  totalOrders: number;
  totalSales: number;
  loading: boolean;
  error: string | null;
}

// ===============================
// 🔹 API Base URL
// ===============================
const API_URL = import.meta.env.VITE_BACKEND_URL;

// ===============================
// 🔹 Async Thunks
// ===============================

// ✅ Fetch all admin orders
export const fetchAllOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: ErrorResponse }
>("adminOrders/fetchAllOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Order[]>(`${API_URL}/api/admin/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to fetch orders" });
  }
});

// ✅ Update order delivery status
export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: string },
  { rejectValue: ErrorResponse }
>("adminOrders/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await axios.put<Order>(
      `${API_URL}/api/admin/orders/${id}`,
      { status }, // ✅ correct body payload
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to update order" });
  }
});

// ✅ Delete an order
export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>("adminOrders/deleteOrder", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/api/admin/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to delete order" });
  }
});

// ===============================
// 🔹 Slice
// ===============================
const initialState: AdminOrderState = {
  orders: [],
  totalOrders: 0,
  totalSales: 0,
  loading: false,
  error: null,
};

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;
        state.totalSales = action.payload.reduce(
          (acc, order) => acc + (order.totalPrice || 0),
          0
        );
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
      });

    // Update order status
    builder.addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
    });

    // Delete order
    builder.addCase(deleteOrder.fulfilled, (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((order) => order._id !== action.payload);
    });
  },
});

export default adminOrderSlice.reducer;
