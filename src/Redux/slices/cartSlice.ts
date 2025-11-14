import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import axios, { AxiosError } from 'axios';

// ✅ ---------- TYPES ----------

export interface CartProduct {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  [key: string]: any;
}

export interface Cart {
  products: CartProduct[];
  totalPrice?: number;
  userId?: string;
  guestId?: string;
  [key: string]: any;
}

export interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
}

// ✅ ---------- HELPERS ----------

const loadCartFromStorage = (): Cart => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : { products: [] };
};

const saveCartToStorage = (cart: Cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// ✅ ---------- ASYNC THUNKS ----------

// Fetch cart (user or guest)
export const fetchCart = createAsyncThunk<
  Cart,
  { userId?: string; guestId?: string },
  { rejectValue: string }
>("cart/fetchCart", async ({ userId, guestId }, { rejectWithValue }) => {
  try {
    const response = await axios.get<Cart>(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
      params: { userId, guestId },
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
  }
});

// Add item to cart
export const addToCart = createAsyncThunk<
  Cart,
  {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    userId?: string;
    guestId?: string;
  },
  { rejectValue: string }
>(
  "cart/addToCart",
  async ({ productId, quantity, size, color, userId, guestId }, { rejectWithValue }) => {
    try {
      const response = await axios.post<Cart>(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        productId,
        quantity,
        size,
        color,
        guestId,
        userId,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

// Update cart item quantity
export const updateCartItemQuantity = createAsyncThunk<
  Cart,
  {
    userId?: string;
    guestId?: string;
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  },
  { rejectValue: string }
>(
  "cart/updateCartItemQuantity",
  async ({ userId, guestId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.put<Cart>(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        userId,
        guestId,
        productId,
        quantity,
        size,
        color,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to update cart");
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk<
  Cart,
  {
    userId?: string;
    guestId?: string;
    productId: string;
    size?: string;
    color?: string;
  },
  { rejectValue: string }
>(
  "cart/removeFromCart",
  async ({ userId, guestId, productId, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.delete<Cart>(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        { data: { userId, guestId, size, color, productId } }
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to remove from cart");
    }
  }
);

// Merge guest cart with user cart
export const mergeCart = createAsyncThunk<
  Cart,
  { guestId: string; user: string },
  { rejectValue: string }
>("cart/mergeCart", async ({ guestId, user }, { rejectWithValue }) => {
  try {
    const response = await axios.post<Cart>(
      `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
      { guestId, user },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue(error.response?.data?.message || "Failed to merge cart");
  }
});

// ✅ ---------- SLICE ----------

const initialState: CartState = {
  cart: loadCartFromStorage(),
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cleanCart: (state) => {
      state.cart = { products: [] };
      localStorage.removeItem("cart");
    },
  },
  extraReducers: (builder) => {
    // helper for DRY pattern
    const handlePending = (state: CartState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: CartState, action: any, message: string) => {
      state.loading = false;
      state.error = action.payload || message;
    };

    builder
      // Fetch cart
      .addCase(fetchCart.pending, handlePending)
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) =>
        handleRejected(state, action, "Failed to fetch cart")
      )

      // Add to cart
      .addCase(addToCart.pending, handlePending)
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) =>
        handleRejected(state, action, "Failed to add to cart")
      )

      // Update quantity
      .addCase(updateCartItemQuantity.pending, handlePending)
      .addCase(updateCartItemQuantity.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) =>
        handleRejected(state, action, "Failed to update cart quantity")
      )

      // Remove from cart
      .addCase(removeFromCart.pending, handlePending)
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) =>
        handleRejected(state, action, "Failed to remove item from cart")
      )

      // Merge cart
      .addCase(mergeCart.pending, handlePending)
      .addCase(mergeCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(mergeCart.rejected, (state, action) =>
        handleRejected(state, action, "Failed to merge carts")
      );
  },
});

export const { cleanCart } = cartSlice.actions;
export default cartSlice.reducer;
