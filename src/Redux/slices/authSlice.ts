import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// =====================
// Types & Interfaces
// =====================

interface User {
  _id: string;
  name: string;
  email: string;
  // add more user fields as needed (like role, avatar, etc.)
}

interface AuthState {
  user: User | null;
  guestId: string;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface ErrorResponse {
  message: string;
}

// =====================
// Load Data from LocalStorage
// =====================

const userFromStorage = localStorage.getItem("userInfo")
  ? (JSON.parse(localStorage.getItem("userInfo") as string) as User)
  : null;

const existingGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", existingGuestId);

// =====================
// Initial State
// =====================

const initialState: AuthState = {
  user: userFromStorage,
  guestId: existingGuestId,
  loading: false,
  error: null,
};

// =====================
// Async Thunks
// =====================

// ✅ Login User
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: ErrorResponse }
>("auth/loginUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<LoginResponse>(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
      userData
    );

    localStorage.setItem("userInfo", JSON.stringify(response.data.user));
    localStorage.setItem("userToken", response.data.token);

    return response.data.user;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Login failed" });
  }
});

// ✅ Register User
export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: ErrorResponse }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<RegisterResponse>(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
      userData
    );

    localStorage.setItem("userInfo", JSON.stringify(response.data.user));
    localStorage.setItem("userToken", response.data.token);

    return response.data.user;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(
      error.response?.data || { message: "Registration failed" }
    );
  }
});

// =====================
// Slice
// =====================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId);
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },

  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      });
  },
});

// =====================
// Exports
// =====================

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;
