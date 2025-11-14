import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// ✅ Define types
export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
}

export interface CheckoutResponse {
  _id: string;
  paymentStatus?: string;
  isPaid?: boolean;
  totalPrice?: number;
  createdAt?: string;
  [key: string]: any;
}

export interface CheckoutState {
  checkout: CheckoutResponse | null;
  loading: boolean;
  error: string | null;
}

// ✅ Async thunk to create checkout (fixed payload)
export const createCheckout = createAsyncThunk<
  CheckoutResponse,
  CheckoutData,
  { rejectValue: string }
>(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      // ✅ Correct request body key
      const response = await axios.post<CheckoutResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        {
          checkoutItem: checkoutData.items, // ✅ Backend expects this
          shippingAddress: checkoutData.shippingAddress,
          paymentMethod: checkoutData.paymentMethod,
          totalPrice: checkoutData.totalPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("❌ Checkout API Error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Checkout failed"
      );
    }
  }
);


// ✅ Initial state
const initialState: CheckoutState = {
  checkout: null,
  loading: false,
  error: null,
};

// ✅ Slice
const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    clearCheckout: (state) => {
      state.checkout = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createCheckout.fulfilled,
        (state, action: PayloadAction<CheckoutResponse>) => {
          state.loading = false;
          state.checkout = action.payload;
        }
      )
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to create checkout";
      });
  },
});

export const { clearCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
