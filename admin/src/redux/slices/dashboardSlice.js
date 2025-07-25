import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// 📦 Individual Async Thunks
export const fetchRevenue = createAsyncThunk("dashboard/fetchRevenue", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/bills/revenue`);
    return res.data;
  } catch (err) {
    return rejectWithValue("Revenue fetch failed");
  }
});

export const fetchTopProducts = createAsyncThunk("dashboard/fetchTopProducts", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/bills/top-selling`);
    return {
      labels: res.data?.labels ?? [],
      data: res.data?.data ?? [],
    };
  } catch (err) {
    return rejectWithValue("Top products fetch failed");
  }
});

export const fetchForecast = createAsyncThunk("dashboard/fetchForecast", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/products/inventory/forecast`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return rejectWithValue("Forecast fetch failed");
  }
});

export const fetchStaffPerformance = createAsyncThunk("dashboard/fetchStaffPerformance", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/bills/staff-performance`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return rejectWithValue("Staff performance fetch failed");
  }
});

export const fetchProducts = createAsyncThunk("dashboard/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/products`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return rejectWithValue("Products fetch failed");
  }
});

export const fetchBills = createAsyncThunk("dashboard/fetchBills", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/bills`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return rejectWithValue("Bills fetch failed");
  }
});

export const fetchStaff = createAsyncThunk("dashboard/fetchStaff", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/staff`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return rejectWithValue("Staff fetch failed");
  }
});

// 🧾 Initial State
const initialState = {
  stats: {
    revenue: null,
    topProducts: { labels: [], data: [] },
    forecast: [],
    staffPerformance: [],
    products: [],
    bills: [],
    staff: [],
  },
  loading: {
    revenue: false,
    topProducts: false,
    forecast: false,
    staffPerformance: false,
    products: false,
    bills: false,
    staff: false,
  },
  error: {
    revenue: null,
    topProducts: null,
    forecast: null,
    staffPerformance: null,
    products: null,
    bills: null,
    staff: null,
  },
};

// 🎯 Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.stats = initialState.stats;
      state.loading = initialState.loading;
      state.error = initialState.error;
    },
  },
  extraReducers: (builder) => {
    const addCases = (thunk, key) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading[key] = true;
          state.error[key] = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading[key] = false;
          state.stats[key] = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading[key] = false;
          state.error[key] = action.payload;
        });
    };

    addCases(fetchRevenue, "revenue");
    addCases(fetchTopProducts, "topProducts");
    addCases(fetchForecast, "forecast");
    addCases(fetchStaffPerformance, "staffPerformance");
    addCases(fetchProducts, "products");
    addCases(fetchBills, "bills");
    addCases(fetchStaff, "staff");
  },
});

// 🧪 Export
export const { clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;
