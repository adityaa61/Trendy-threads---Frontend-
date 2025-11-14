import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// =====================
// Interfaces & Types
// =====================

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ErrorResponse {
  message: string;
}

interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

// =====================
// Async Thunks
// =====================

// ✅ Fetch all users (Admin only)
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: ErrorResponse }
>("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<User[]>(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to fetch users" });
  }
});

// ✅ Add a new user
export const addUser = createAsyncThunk<
  User,
  { name: string; email: string; role: string; password?: string },
  { rejectValue: ErrorResponse }
>("admin/addUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<User>(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to add user" });
  }
});

// ✅ Update user info
export const updateUser = createAsyncThunk<
  User,
  { id: string; name: string; email: string; role: string },
  { rejectValue: ErrorResponse }
>("admin/updateUser", async ({ id, name, email, role }, { rejectWithValue }) => {
  try {
    const response = await axios.put<User>(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
      { name, email, role },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to update user" });
  }
});

// ✅ Delete a user
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>("admin/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return rejectWithValue(error.response?.data || { message: "Failed to delete user" });
  }
});

// =====================
// Slice
// =====================

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      });

    // Add User
    builder
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add user";
      });

    // Update User
    builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex((user) => user._id === updatedUser._id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
    });

    // Delete User
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    });
  },
});

export default adminSlice.reducer;
